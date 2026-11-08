-- =====================================================================
--  SprintAlert - WoW Forever (Classic+, client 1.60.1, API Retail 12.x)
--  Affiche "SPRINT PRÊT !" + un son quand le Sprint du voleur revient.
-- =====================================================================

local ADDON_NAME = ...

-- Réglages faciles à modifier ------------------------------------------
local NOM_DU_SORT   = "Sprint"          -- nom du sort cherché dans le grimoire
local TEXTE_ALERTE  = "SPRINT PRÊT !"
local SEUIL_GCD     = 2                 -- un cooldown de 2 s ou moins = GCD, ignoré
local DUREE_PLEIN   = 2                 -- secondes affichées en plein
local DUREE_FONDU   = 1                 -- secondes de fondu
local SON_PAR_DEFAUT = (SOUNDKIT and SOUNDKIT.RAID_WARNING) or 8959

local DEFAUTS = {
    texte  = true,
    son    = true,
    sonID  = SON_PAR_DEFAUT,
    taille = 48,
}

-- Variables internes ----------------------------------------------------
local PREFIXE    = "|cff33ff33[SprintAlert]|r "
local db                         -- = SprintAlertDB une fois chargé
local estVoleur  = false
local spellID    = nil           -- ID de Sprint trouvé dans le grimoire
local enCooldown = false         -- Sprint a-t-il vraiment été en cooldown ?
local jetonTimer = 0             -- pour ignorer les anciens timers

local function msg(texte)
    DEFAULT_CHAT_FRAME:AddMessage(PREFIXE .. texte)
end

-- =====================================================================
--  Affichage : Frame + FontString perso
-- =====================================================================
local POLICE = STANDARD_TEXT_FONT or "Fonts\\FRIZQT__.TTF"

local cadre = CreateFrame("Frame", "SprintAlertFrame", UIParent)
cadre:SetSize(1200, 150)
cadre:SetPoint("CENTER", UIParent, "CENTER", 0, 150)
cadre:SetFrameStrata("HIGH")
cadre:Hide()

local texte = cadre:CreateFontString(nil, "OVERLAY")
texte:SetPoint("CENTER")
texte:SetTextColor(0.3, 1, 0.2)          -- vert vif
texte:SetShadowColor(0, 0, 0, 1)
texte:SetShadowOffset(3, -3)

local function appliquerTaille()
    local taille = (db and tonumber(db.taille)) or DEFAUTS.taille
    if not texte:SetFont(POLICE, taille, "THICKOUTLINE") then
        texte:SetFont("Fonts\\FRIZQT__.TTF", taille, "THICKOUTLINE")
    end
    texte:SetText(TEXTE_ALERTE)
end

local ecoule = 0
cadre:SetScript("OnUpdate", function(self, elapsed)
    ecoule = ecoule + (elapsed or 0)
    if ecoule < DUREE_PLEIN then
        self:SetAlpha(1)
    elseif ecoule < DUREE_PLEIN + DUREE_FONDU then
        self:SetAlpha(1 - (ecoule - DUREE_PLEIN) / DUREE_FONDU)
    else
        self:Hide()
    end
end)

local function jouerSon(id)
    id = tonumber(id)
    if not id then return end
    -- pcall : un ID de son invalide ne doit jamais casser l'addon
    pcall(PlaySound, id, "Master")
end

local function declencherAlerte()
    if not db then return end
    if db.texte then
        appliquerTaille()
        ecoule = 0
        cadre:SetAlpha(1)
        cadre:Show()
    end
    if db.son then
        jouerSon(db.sonID)
    end
end

-- =====================================================================
--  Recherche de Sprint dans le grimoire (par nom, pas d'ID en dur)
-- =====================================================================
local function memeNom(a)
    return type(a) == "string" and a:lower() == NOM_DU_SORT:lower()
end

local function nomDuSort(id)
    if C_Spell and C_Spell.GetSpellName then
        return C_Spell.GetSpellName(id)
    elseif C_Spell and C_Spell.GetSpellInfo then
        local info = C_Spell.GetSpellInfo(id)
        return info and info.name
    end
end

local function chercherSprint()
    -- 1) API moderne C_SpellBook (Retail 11.0+)
    if C_SpellBook and C_SpellBook.GetNumSpellBookSkillLines
       and C_SpellBook.GetSpellBookSkillLineInfo and C_SpellBook.GetSpellBookItemInfo then
        local banque = (Enum and Enum.SpellBookSpellBank and Enum.SpellBookSpellBank.Player) or 0
        local typeSort = Enum and Enum.SpellBookItemType and Enum.SpellBookItemType.Spell
        for i = 1, (C_SpellBook.GetNumSpellBookSkillLines() or 0) do
            local ligne = C_SpellBook.GetSpellBookSkillLineInfo(i)
            if ligne and ligne.itemIndexOffset and ligne.numSpellBookItems then
                for slot = ligne.itemIndexOffset + 1, ligne.itemIndexOffset + ligne.numSpellBookItems do
                    local item = C_SpellBook.GetSpellBookItemInfo(slot, banque)
                    if item and item.spellID and (typeSort == nil or item.itemType == typeSort) then
                        local nom = item.name or nomDuSort(item.spellID)
                        if memeNom(nom) and not item.isPassive then
                            return item.spellID
                        end
                    end
                end
            end
        end
    end

    -- 2) Ancienne API du grimoire (au cas où le client l'aurait gardée)
    if GetNumSpellTabs and GetSpellTabInfo and GetSpellBookItemName and GetSpellBookItemInfo then
        local livre = BOOKTYPE_SPELL or "spell"
        for t = 1, (GetNumSpellTabs() or 0) do
            local _, _, offset, nb = GetSpellTabInfo(t)
            if offset and nb then
                for slot = offset + 1, offset + nb do
                    local nom = GetSpellBookItemName(slot, livre)
                    if memeNom(nom) then
                        local _, id = GetSpellBookItemInfo(slot, livre)
                        if id then return id end
                    end
                end
            end
        end
    end

    -- 3) Dernier recours : recherche par nom (ne marche que pour un sort connu)
    if C_Spell and C_Spell.GetSpellInfo then
        local info = C_Spell.GetSpellInfo(NOM_DU_SORT)
        if info and info.spellID then return info.spellID end
    end
    return nil
end

-- =====================================================================
--  Lecture du cooldown
--  Renvoie : true = en cooldown (hors GCD), false = prêt,
--            nil = illisible (valeur "secrète" en combat, API absente...)
--  Renvoie aussi le temps restant quand c'est en cooldown.
-- =====================================================================
local function estSecret(v)
    return issecretvalue ~= nil and issecretvalue(v) == true
end

local function lireCooldown()
    if not spellID then return nil end
    local debut, duree
    if C_Spell and C_Spell.GetSpellCooldown then
        local cd = C_Spell.GetSpellCooldown(spellID)
        if type(cd) ~= "table" then return nil end
        debut, duree = cd.startTime, cd.duration
    elseif GetSpellCooldown then   -- fallback si C_Spell n'existe pas
        debut, duree = GetSpellCooldown(spellID)
    else
        return nil
    end
    if debut == nil or duree == nil or estSecret(debut) or estSecret(duree) then
        return nil
    end
    local ok, enCD, reste = pcall(function()
        if duree > SEUIL_GCD and debut > 0 then
            return true, (debut + duree) - GetTime()
        end
        return false, 0
    end)
    if not ok then return nil end
    return enCD, reste
end

-- =====================================================================
--  Logique principale
-- =====================================================================
local verifier  -- déclaré plus bas

local function programmerVerification(reste)
    if not (C_Timer and C_Timer.After) or not reste then return end
    jetonTimer = jetonTimer + 1
    local monJeton = jetonTimer
    C_Timer.After(math.max(reste, 0) + 0.1, function()
        if monJeton == jetonTimer then verifier() end
    end)
end

verifier = function()
    if not estVoleur or not spellID then return end
    local enCD, reste = lireCooldown()
    if enCD == nil then return end          -- illisible : on garde l'état actuel
    if enCD then
        if not enCooldown then
            enCooldown = true
        end
        programmerVerification(reste)       -- re-vérifie pile à la fin du CD
    elseif enCooldown then
        enCooldown = false
        declencherAlerte()
    end
end

-- Au chargement / reload : on note seulement l'état, sans alerte
local function initialiser()
    estVoleur = (select(2, UnitClass("player")) == "ROGUE")
    if not estVoleur then return end
    spellID = chercherSprint()
    if not spellID then return end
    local enCD, reste = lireCooldown()
    enCooldown = (enCD == true)
    if enCooldown then programmerVerification(reste) end
end

-- =====================================================================
--  Événements
-- =====================================================================
local ev = CreateFrame("Frame")
ev:RegisterEvent("ADDON_LOADED")
ev:RegisterEvent("PLAYER_ENTERING_WORLD")
ev:RegisterEvent("SPELL_UPDATE_COOLDOWN")
ev:RegisterEvent("SPELLS_CHANGED")
ev:RegisterEvent("PLAYER_REGEN_ENABLED")   -- relecture à la sortie du combat

ev:SetScript("OnEvent", function(self, event, arg1)
    if event == "ADDON_LOADED" then
        if arg1 ~= ADDON_NAME then return end
        if type(SprintAlertDB) ~= "table" then SprintAlertDB = {} end
        db = SprintAlertDB
        for k, v in pairs(DEFAUTS) do
            if db[k] == nil then db[k] = v end
        end
        appliquerTaille()
        self:UnregisterEvent("ADDON_LOADED")
    elseif event == "PLAYER_ENTERING_WORLD" then
        initialiser()
    elseif event == "SPELLS_CHANGED" then
        if estVoleur then
            local avant = spellID
            spellID = chercherSprint()
            if spellID and spellID ~= avant then
                local enCD = lireCooldown()
                enCooldown = (enCD == true)
            end
        end
    else -- SPELL_UPDATE_COOLDOWN, PLAYER_REGEN_ENABLED
        verifier()
    end
end)

-- =====================================================================
--  Commandes /sa et /sprintalert
-- =====================================================================
local function oui(v) return v and "|cff00ff00oui|r" or "|cffff0000non|r" end

local function afficherAide()
    msg("Commandes :")
    msg("  /sa test  - joue l'alerte complète")
    msg("  /sa mode texte || son || les deux")
    msg("  /sa son <id>  - change le son (ex : /sa son 8959)")
    msg("  /sa taille <nombre>  - taille du texte (ex : /sa taille 60)")
    msg(("Réglages : texte %s, son %s, son ID %s, taille %s"):format(
        oui(db.texte), oui(db.son), tostring(db.sonID), tostring(db.taille)))
    if not estVoleur then
        msg("|cffffaa00Ton perso n'est pas voleur : la surveillance est inactive.|r")
    elseif not spellID then
        msg("|cffffaa00Sort \"" .. NOM_DU_SORT .. "\" introuvable dans ton grimoire.|r")
    else
        msg("Sprint trouvé (ID " .. tostring(spellID) .. ")"
            .. (enCooldown and ", en recharge." or ", prêt."))
    end
end

SLASH_SPRINTALERT1 = "/sa"
SLASH_SPRINTALERT2 = "/sprintalert"
SlashCmdList["SPRINTALERT"] = function(saisie)
    if not db then return end
    saisie = (saisie or ""):lower():gsub("^%s+", ""):gsub("%s+$", "")
    local cmd, reste = saisie:match("^(%S*)%s*(.-)$")

    if cmd == "" or cmd == "aide" or cmd == "help" then
        afficherAide()

    elseif cmd == "test" then
        declencherAlerte()
        if not db.texte and not db.son then msg("Texte et son sont tous les deux coupés.") end

    elseif cmd == "mode" then
        if reste == "texte" then
            db.texte, db.son = true, false
        elseif reste == "son" then
            db.texte, db.son = false, true
        elseif reste == "les deux" or reste == "deux" or reste == "tout" then
            db.texte, db.son = true, true
        else
            msg("Usage : /sa mode texte || son || les deux")
            return
        end
        msg(("Mode : texte %s, son %s"):format(oui(db.texte), oui(db.son)))

    elseif cmd == "son" then
        local id = tonumber(reste)
        if not id or id <= 0 then
            msg("Usage : /sa son <id>  (actuel : " .. tostring(db.sonID) .. ")")
            return
        end
        db.sonID = math.floor(id)
        msg("Son réglé sur " .. db.sonID .. " (aperçu joué).")
        jouerSon(db.sonID)

    elseif cmd == "taille" then
        local n = tonumber(reste)
        if not n or n < 10 or n > 200 then
            msg("Usage : /sa taille <nombre entre 10 et 200>  (actuelle : " .. tostring(db.taille) .. ")")
            return
        end
        db.taille = math.floor(n)
        appliquerTaille()
        msg("Taille du texte : " .. db.taille)

    else
        afficherAide()
    end
end
