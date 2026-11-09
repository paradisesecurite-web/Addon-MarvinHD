-- =====================================================================
--  SprintAlert - WoW Forever (Classic+, client 1.60.1, API Retail 12.x)
--  Alertes voleur :
--    - "SPRINT PRÊT !" quand Sprint revient de recharge
--    - "RIPOSTE !" quand tu pares une attaque et que Riposte est dispo
-- =====================================================================

local ADDON_NAME = ...

-- Réglages faciles à modifier ------------------------------------------
local NOM_SPRINT     = "Sprint"         -- noms cherchés dans le grimoire
local NOM_RIPOSTE    = "Riposte"
local TEXTE_SPRINT   = "SPRINT PRÊT !"
local TEXTE_RIPOSTE  = "RIPOSTE !"
local SEUIL_GCD      = 2                -- un cooldown de 2 s ou moins = GCD, ignoré
local ANTI_SPAM_RIPOSTE = 1             -- secondes minimum entre deux alertes Riposte
local DUREE_PLEIN    = 2                -- secondes affichées en plein
local DUREE_FONDU    = 1                -- secondes de fondu

local DEFAUTS = {
    texte      = true,      -- afficher le texte (toutes alertes)
    son        = true,      -- jouer le son (toutes alertes)
    sonID      = (SOUNDKIT and SOUNDKIT.RAID_WARNING) or 8959,           -- son Sprint
    taille     = 48,
    riposte    = true,      -- alerte Riposte activée
    sonRiposte = (SOUNDKIT and SOUNDKIT.ALARM_CLOCK_WARNING_3) or 12867, -- son Riposte
}

-- Variables internes ----------------------------------------------------
local PREFIXE    = "|cff33ff33[SprintAlert]|r "
local db                          -- = SprintAlertDB une fois chargé
local estVoleur  = false

local sprintID   = nil            -- ID de Sprint trouvé dans le grimoire
local enCooldown = false          -- Sprint a-t-il vraiment été en cooldown ?
local jetonTimer = 0              -- pour ignorer les anciens timers

local riposteID     = nil         -- ID de Riposte (nil = pas le talent)
local riposteActive = false       -- Riposte était-elle utilisable au dernier test ?
local derniereRiposte = -100      -- GetTime() de la dernière alerte Riposte

local function msg(texte)
    if DEFAULT_CHAT_FRAME then DEFAULT_CHAT_FRAME:AddMessage(PREFIXE .. texte) end
end

local function estSecret(v)
    return issecretvalue ~= nil and issecretvalue(v) == true
end

-- =====================================================================
--  Affichage : un seul Frame + FontString pour toutes les alertes
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

-- Fonction d'affichage commune : texte + son en paramètres
local function afficherAlerte(message, sonID)
    if not db then return end
    if db.texte then
        appliquerTaille()
        texte:SetText(message)
        ecoule = 0
        cadre:SetAlpha(1)
        cadre:Show()
    end
    if db.son then
        jouerSon(sonID)
    end
end

-- =====================================================================
--  Recherche d'un sort dans le grimoire (par nom, pas d'ID en dur)
-- =====================================================================
local function memeNom(a, nom)
    return type(a) == "string" and a:lower() == nom:lower()
end

local function nomDuSort(id)
    if C_Spell and C_Spell.GetSpellName then
        return C_Spell.GetSpellName(id)
    elseif C_Spell and C_Spell.GetSpellInfo then
        local info = C_Spell.GetSpellInfo(id)
        return info and info.name
    end
end

local function chercherSort(nomCherche)
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
                        if memeNom(nom, nomCherche) and not item.isPassive then
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
                    if memeNom(nom, nomCherche) then
                        local _, id = GetSpellBookItemInfo(slot, livre)
                        if id then return id end
                    end
                end
            end
        end
    end

    -- 3) Dernier recours : recherche par nom (ne marche que pour un sort connu)
    if C_Spell and C_Spell.GetSpellInfo then
        local info = C_Spell.GetSpellInfo(nomCherche)
        if info and info.spellID then return info.spellID end
    end
    return nil
end

-- =====================================================================
--  Lecture d'un cooldown
--  Renvoie : true = en cooldown (hors GCD), false = prêt,
--            nil = illisible (valeur "secrète" en combat, API absente...)
--  + le temps restant quand c'est en cooldown.
-- =====================================================================
local function lireCooldown(id)
    if not id then return nil end
    local debut, duree
    if C_Spell and C_Spell.GetSpellCooldown then
        local cd = C_Spell.GetSpellCooldown(id)
        if type(cd) ~= "table" then return nil end
        debut, duree = cd.startTime, cd.duration
    elseif GetSpellCooldown then   -- fallback si C_Spell n'existe pas
        debut, duree = GetSpellCooldown(id)
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
--  SPRINT
-- =====================================================================
local verifierSprint  -- déclaré plus bas

local function programmerVerification(reste)
    if not (C_Timer and C_Timer.After) or not reste then return end
    jetonTimer = jetonTimer + 1
    local monJeton = jetonTimer
    C_Timer.After(math.max(reste, 0) + 0.1, function()
        if monJeton == jetonTimer then verifierSprint() end
    end)
end

verifierSprint = function()
    if not estVoleur or not sprintID then return end
    local enCD, reste = lireCooldown(sprintID)
    if enCD == nil then return end          -- illisible : on garde l'état actuel
    if enCD then
        enCooldown = true
        programmerVerification(reste)       -- re-vérifie pile à la fin du CD
    elseif enCooldown then
        enCooldown = false
        afficherAlerte(TEXTE_SPRINT, db and db.sonID)
    end
end

-- =====================================================================
--  RIPOSTE
-- =====================================================================

-- Riposte est-elle "active" (proc après parade) ?
-- true / false, ou nil si illisible.
-- IsSpellUsable renvoie (utilisable, manqueRessource) : si l'énergie manque,
-- le proc est quand même actif, donc on compte les deux cas.
local function lireRiposteActive()
    if not riposteID then return nil end
    local utilisable, manqueRessource
    if C_Spell and C_Spell.IsSpellUsable then
        utilisable, manqueRessource = C_Spell.IsSpellUsable(riposteID)
    elseif IsUsableSpell then          -- fallback ancienne API
        utilisable, manqueRessource = IsUsableSpell(riposteID)
    else
        return nil
    end
    if estSecret(utilisable) or estSecret(manqueRessource) then return nil end
    return (utilisable == true) or (manqueRessource == true)
end

local function alerteRiposte()
    if not db or not db.riposte or not estVoleur or not riposteID then return end
    local maintenant = GetTime()
    if maintenant - derniereRiposte < ANTI_SPAM_RIPOSTE then return end
    if lireCooldown(riposteID) == true then return end   -- Riposte en recharge
    derniereRiposte = maintenant
    afficherAlerte(TEXTE_RIPOSTE, db.sonRiposte)
end

-- Détection n°2 : Riposte passe de "pas utilisable" à "utilisable"
local function verifierRiposte()
    if not estVoleur or not riposteID then return end
    local active = lireRiposteActive()
    if active == nil then return end
    if active and not riposteActive then
        alerteRiposte()
    end
    riposteActive = active
end

-- Détection n°1 : combat log (peut être bloqué en API 12.x, d'où les protections)
local lireCombatLog = CombatLogGetCurrentEventInfo
    or (C_CombatLog and C_CombatLog.GetCurrentEventInfo)

local function surCombatLog()
    if not estVoleur or not riposteID or not lireCombatLog then return end
    local ok, _, sousEvent, _, _, _, _, _, destGUID, _, _, _, a12, _, _, a15 = pcall(lireCombatLog)
    if not ok or not sousEvent or not destGUID then return end
    if estSecret(destGUID) or destGUID ~= UnitGUID("player") then return end
    local typeRate
    if sousEvent == "SWING_MISSED" then
        typeRate = a12                     -- SWING : missType en 12e position
    elseif sousEvent == "SPELL_MISSED" or sousEvent == "RANGE_MISSED" then
        typeRate = a15                     -- SPELL/RANGE : après spellId, nom, école
    end
    if typeRate == "PARRY" then
        alerteRiposte()
    end
end

-- =====================================================================
--  Initialisation (connexion / reload / changement de sorts)
-- =====================================================================
local function rechercherSorts()
    sprintID  = chercherSort(NOM_SPRINT)
    riposteID = chercherSort(NOM_RIPOSTE)
    riposteActive = (lireRiposteActive() == true)   -- état de départ, sans alerte
end

local function initialiser()
    estVoleur = (select(2, UnitClass("player")) == "ROGUE")
    if not estVoleur then return end
    rechercherSorts()
    local enCD, reste = lireCooldown(sprintID)
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
ev:RegisterEvent("SPELL_UPDATE_USABLE")
ev:RegisterEvent("SPELLS_CHANGED")
ev:RegisterEvent("PLAYER_REGEN_ENABLED")   -- relecture à la sortie du combat
-- Le combat log peut être interdit aux addons selon le client : pcall
local combatLogOK = pcall(ev.RegisterEvent, ev, "COMBAT_LOG_EVENT_UNFILTERED")

ev:SetScript("OnEvent", function(self, event, arg1)
    if event == "COMBAT_LOG_EVENT_UNFILTERED" then
        surCombatLog()
    elseif event == "SPELL_UPDATE_USABLE" then
        verifierRiposte()
    elseif event == "SPELL_UPDATE_COOLDOWN" then
        verifierSprint()
        verifierRiposte()
    elseif event == "PLAYER_REGEN_ENABLED" then
        verifierSprint()
    elseif event == "ADDON_LOADED" then
        if arg1 ~= ADDON_NAME then return end
        if type(SprintAlertDB) ~= "table" then SprintAlertDB = {} end
        db = SprintAlertDB
        for k, v in pairs(DEFAUTS) do      -- ajoute les nouvelles clés sans écraser
            if db[k] == nil then db[k] = v end
        end
        appliquerTaille()
        self:UnregisterEvent("ADDON_LOADED")
    elseif event == "PLAYER_ENTERING_WORLD" then
        initialiser()
    elseif event == "SPELLS_CHANGED" then
        if estVoleur then
            local avant = sprintID
            rechercherSorts()
            if sprintID and sprintID ~= avant then
                enCooldown = (lireCooldown(sprintID) == true)
            end
        end
    end
end)

-- =====================================================================
--  Commandes /sa et /sprintalert
-- =====================================================================
local function oui(v) return v and "|cff00ff00oui|r" or "|cffff0000non|r" end

local function afficherAide()
    msg("Commandes :")
    msg("  /sa test  (ou /sa test sprint)  - joue l'alerte Sprint")
    msg("  /sa test riposte  - joue l'alerte Riposte")
    msg("  /sa mode texte || son || les deux  - pour toutes les alertes")
    msg("  /sa son <id>  - son du Sprint (ex : /sa son 8959)")
    msg("  /sa sonriposte <id>  - son de Riposte (ex : /sa sonriposte 12867)")
    msg("  /sa riposte on || off  - active/coupe l'alerte Riposte")
    msg("  /sa taille <nombre>  - taille du texte (ex : /sa taille 60)")
    msg(("Réglages : texte %s, son %s, taille %s"):format(
        oui(db.texte), oui(db.son), tostring(db.taille)))
    msg(("Sprint : son %s  ||  Riposte : %s, son %s"):format(
        tostring(db.sonID), oui(db.riposte), tostring(db.sonRiposte)))
    if not estVoleur then
        msg("|cffffaa00Ton perso n'est pas voleur : la surveillance est inactive.|r")
        return
    end
    if sprintID then
        msg("Sprint trouvé (ID " .. tostring(sprintID) .. ")"
            .. (enCooldown and ", en recharge." or ", prêt."))
    else
        msg("|cffffaa00Sort \"" .. NOM_SPRINT .. "\" introuvable dans ton grimoire.|r")
    end
    if riposteID then
        msg("Riposte trouvée (ID " .. tostring(riposteID) .. ")"
            .. (combatLogOK and "." or " - combat log indisponible, détection par usabilité seulement."))
    else
        msg("|cffffaa00Riposte introuvable dans ton grimoire (talent non pris ?) : alerte inactive.|r")
    end
end

local function reglerSon(cle, reste, usage)
    local id = tonumber(reste)
    if not id or id <= 0 then
        msg("Usage : " .. usage .. " <id>  (actuel : " .. tostring(db[cle]) .. ")")
        return
    end
    db[cle] = math.floor(id)
    msg("Son réglé sur " .. db[cle] .. " (aperçu joué).")
    jouerSon(db[cle])
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
        if reste == "riposte" then
            afficherAlerte(TEXTE_RIPOSTE, db.sonRiposte)
        elseif reste == "" or reste == "sprint" then
            afficherAlerte(TEXTE_SPRINT, db.sonID)
        else
            msg("Usage : /sa test sprint || riposte")
            return
        end
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
        reglerSon("sonID", reste, "/sa son")

    elseif cmd == "sonriposte" then
        reglerSon("sonRiposte", reste, "/sa sonriposte")

    elseif cmd == "riposte" then
        if reste == "on" then
            db.riposte = true
        elseif reste == "off" then
            db.riposte = false
        else
            msg("Usage : /sa riposte on || off  (actuel : " .. (db.riposte and "on" or "off") .. ")")
            return
        end
        msg("Alerte Riposte : " .. oui(db.riposte))

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
