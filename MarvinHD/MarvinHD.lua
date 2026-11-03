-- =====================================================================
--  MarvinHD - World of Warcraft Classic Era
--  Une phrase moqueuse (gentille !) sur Marvin HD à chaque cible mob.
-- =====================================================================
--  PHRASES : modifie / ajoute librement tes phrases ici.
--  %s = nom du mob, %d = niveau du mob (facultatifs, dans n'importe quel ordre)
-- =====================================================================

local PHRASES = {
    "ATTENTION : cible plus dure à tuer que Marvin HD",
    "%s niveau %d... Marvin a déjà perdu contre lui",
    "Même %s joue mieux que Marvin HD",
    "Analyse terminée : %s a plus de DPS que Marvin HD",
    "Marvin HD est mort ici. Deux fois.",
    "Conseil : ne pas laisser Marvin HD tanker %s",
    "%s a demandé un autographe à Marvin HD... puis l'a tué",
    "Statistique : 9 Marvin HD sur 10 perdent contre %s",
    "%s connaît mieux ses sorts que Marvin HD",
    "Alerte : %s a déjà farmé Marvin HD au cimetière",
    "Marvin HD a rage-quit contre %s la semaine dernière",
    "%s niveau %d : le cauchemar récurrent de Marvin HD",
    "Si Marvin HD tire l'aggro sur %s, préparez la résurrection",
    "%s ne fuit pas. Contrairement à Marvin HD.",
    "Marvin HD appelle ça \"un pull compliqué\"",
    "Le Guide du Routard déconseille %s à Marvin HD",
    "Marvin HD a déjà payé 3 réparations à cause de %s",
    "%s : sponsor officiel des morts de Marvin HD",
    "Marvin HD a cherché la quête de %s sur YouTube. Toujours bloqué.",
    "Rumeur : %s a son propre fan-club de Marvin HD au cimetière",
    "Marvin HD dit que %s a lag. %s n'a pas lag.",
    "Esprit Guérisseur : \"Ah, Marvin HD, encore toi ?\"",
    "%s a un meilleur équipement que Marvin HD",
    "Ici repose l'honneur de Marvin HD",
    "Marvin HD a déjà tenté de soloter %s. Spoiler : non.",
    "Marvin HD a cliqué sur ses sorts. Ça explique tout.",
    "Pendant que Marvin HD cherche son raccourci, %s attaque",
    "%s a appris à jouer en regardant Marvin HD mourir",
    "Marvin HD considère %s comme un boss de raid",
    "Conseil de pro : ne jamais suivre Marvin HD vers %s",
    "Marvin HD a déclaré forfait face à %s niveau %d",
    "%s a plus de PV que Marvin HD de neurones en raid",
    "Marvin HD a backpédalé face à %s. Il backpédale encore.",
    "Breaking news : Marvin HD a enfin touché %s. Une fois.",
    "%s : excellent entraînement pour Marvin HD... dans 10 ans",
}

-- Phrases spéciales pour les mobs de très bas niveau
local PHRASES_BAS_NIVEAU = {
    "Niveau %d : le boss final de Marvin HD",
    "%s niveau %d... Marvin HD a demandé un groupe",
    "Marvin HD a besoin d'un heal contre %s",
    "%s est niveau %d. Marvin HD est toujours mort.",
    "Lapin, sanglier ou %s : Marvin HD perd quand même",
    "Marvin HD prépare sa stratégie de raid contre %s (niveau %d)",
    "Alerte rouge : %s niveau %d. Marvin HD lance son Pierre de foyer.",
}

-- Réglages
local SEUIL_BAS_NIVEAU = 5       -- niveau max d'un mob "très bas niveau"
local DELAI_ENTRE_PHRASES = 2    -- secondes minimum entre deux phrases
local DUREE_AFFICHAGE = 2.5      -- secondes affichées en plein
local DUREE_FONDU = 1.0          -- secondes de fondu
local SON_ALERTE = (SOUNDKIT and SOUNDKIT.RAID_WARNING) or 8959

-- =====================================================================
--  Code (pas besoin de toucher en dessous)
-- =====================================================================

local PREFIXE = "|cffff8000[MarvinHD]|r "
local derniereFois = 0
local dernierePhrase = nil

-- Frame d'affichage façon alerte de raid
local frame = CreateFrame("Frame", "MarvinHDAlertFrame", UIParent)
frame:SetSize(1000, 100)
frame:SetPoint("CENTER", UIParent, "CENTER", 0, 180)
frame:SetFrameStrata("HIGH")
frame:Hide()

local texte = frame:CreateFontString(nil, "OVERLAY")
texte:SetFont("Fonts\\FRIZQT__.TTF", 32, "THICKOUTLINE")
texte:SetPoint("CENTER")
texte:SetWidth(1000)
texte:SetTextColor(1, 0.35, 0)   -- rouge/orange
texte:SetShadowColor(0, 0, 0, 1)
texte:SetShadowOffset(2, -2)

local ecoule = 0
frame:SetScript("OnUpdate", function(self, elapsed)
    ecoule = ecoule + elapsed
    if ecoule < DUREE_AFFICHAGE then
        self:SetAlpha(1)
    elseif ecoule < DUREE_AFFICHAGE + DUREE_FONDU then
        self:SetAlpha(1 - (ecoule - DUREE_AFFICHAGE) / DUREE_FONDU)
    else
        self:Hide()
    end
end)

-- Échappe les % d'un texte utilisé comme remplacement dans gsub
local function echapper(s)
    return (tostring(s):gsub("%%", "%%%%"))
end

-- Choisit une phrase au hasard, jamais la même que la précédente
local function choisirPhrase(liste)
    if #liste == 1 then return liste[1] end
    local phrase
    repeat
        phrase = liste[math.random(#liste)]
    until phrase ~= dernierePhrase
    return phrase
end

local function afficher(nom, niveau)
    local liste = PHRASES
    if niveau and niveau > 0 and niveau <= SEUIL_BAS_NIVEAU then
        liste = PHRASES_BAS_NIVEAU
    end

    local phrase = choisirPhrase(liste)
    dernierePhrase = phrase

    local niveauTexte = (niveau and niveau > 0) and tostring(niveau) or "??"
    local message = phrase:gsub("%%s", echapper(nom or "Ce truc"))
    message = message:gsub("%%d", echapper(niveauTexte))

    texte:SetText(message)
    ecoule = 0
    frame:SetAlpha(1)
    frame:Show()
    PlaySound(SON_ALERTE, "Master")
end

local function surChangementDeCible()
    if not MarvinHDDB.actif then return end
    if not UnitExists("target") then return end
    if UnitIsPlayer("target") then return end
    if not UnitCanAttack("player", "target") then return end

    local maintenant = GetTime()
    if maintenant - derniereFois < DELAI_ENTRE_PHRASES then return end
    derniereFois = maintenant

    afficher(UnitName("target"), UnitLevel("target"))
end

-- Événements
local evenements = CreateFrame("Frame")
evenements:RegisterEvent("ADDON_LOADED")
evenements:RegisterEvent("PLAYER_TARGET_CHANGED")
evenements:SetScript("OnEvent", function(self, event, arg1)
    if event == "ADDON_LOADED" and arg1 == "MarvinHD" then
        MarvinHDDB = MarvinHDDB or {}
        if MarvinHDDB.actif == nil then MarvinHDDB.actif = true end
        print(PREFIXE .. "chargé. Marvin HD n'a qu'à bien se tenir. (/marvin pour activer/désactiver, /marvin test)")
        self:UnregisterEvent("ADDON_LOADED")
    elseif event == "PLAYER_TARGET_CHANGED" then
        surChangementDeCible()
    end
end)

-- Commande /marvin
SLASH_MARVINHD1 = "/marvin"
SlashCmdList["MARVINHD"] = function(msg)
    msg = strlower(strtrim(msg or ""))
    if msg == "test" then
        local niveau = math.random(1, 60)
        afficher("Kobold vermineux", niveau)
    else
        MarvinHDDB.actif = not MarvinHDDB.actif
        if MarvinHDDB.actif then
            print(PREFIXE .. "|cff00ff00activé|r. Marvin HD tremble déjà.")
        else
            print(PREFIXE .. "|cffff0000désactivé|r. Marvin HD respire... pour l'instant.")
        end
    end
end
