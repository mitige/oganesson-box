# Oganesson Box 🔴

Application de bureau **Electron** ultra esthétique qui visualise des atomes
d'**oganesson** (Og, élément 118) interagissant dans une boîte de verre
translucide. Les atomes sont **rougeoyants** et leur physique d'interaction
est calculée en temps réel.

![preview](https://via.placeholder.com/800x200/06030a/ff2a2a?text=Oganesson+Box)

## ✨ Fonctionnalités

- **Rendu 3D temps réel** avec Three.js
- **Atomes rouges** émissifs avec halo lumineux (sprites additifs)
- **Post-traitement Bloom** (UnrealBloomPass) pour la lueur néon
- **Physique d'interaction** : potentiel de Lennard-Jones adouci
  (répulsion forte + attraction faible, typique d'un gaz noble)
- **Boîte de verre** translucide (MeshPhysicalMaterial avec transmission)
- **Poussière atmosphérique** flottante pour l'ambiance
- **Thermostat** : agitation thermique pilotable
- **UI glassmorphism** rouge, contrôlée par sliders :
  - Nombre d'atomes
  - Température (agitation)
  - Force d'interaction
  - Intensité de la lueur (bloom)
  - Rotation auto de la caméra
- **Caméra orbitale** : glisser pour tourner, molette pour zoomer

## 🚀 Installation

```bash
cd oganesson-box
npm install
npm start
```

> Three.js est chargé via CDN (importmap) : une connexion internet est
> nécessaire au premier lancement. (Voir section hors-ligne ci-dessous.)

## 🎛️ Utilisation

| Contrôle | Action |
|---|---|
| Glisser la souris | Orbiter autour de la boîte |
| Molette | Zoomer |
| Sliders (panneau droit) | Ajuster la simulation |
| Réinitialiser | Re-générer les atomes |

## 🧪 Détails techniques

### Potentiel d'interaction
On utilise un potentiel de **Lennard-Jones** adouci :

$$F = \frac{24\varepsilon}{r}\left[2\left(\frac{\sigma}{r}\right)^{13} - \left(\frac{\sigma}{r}\right)^{7}\right]$$

Avec un **cut-off** à `2.5σ` et un facteur de répulsion majoré pour rendre
visible la nature « gaz noble » (Og est théoriquement un gaz noble, même si
son caractère est prédit plus réactif que les autres).

### Stabilité numérique
- Sous-pas de temps (substeps)
- Bornage des forces et vitesses
- Amortissement global léger
- Collisions élastiques (restitution 0.9) sur les 6 parois

## 🔧 Mode hors-ligne (optionnel)

Pour fonctionner sans internet, téléchargez Three.js localement et remplacez
l'importmap dans `index.html` :

```html
<script type="importmap">
{
  "imports": {
    "three": "./vendor/three.module.js",
    "three/addons/": "./vendor/jsm/"
  }
}
</script>
```

## 📁 Structure

```
oganesson-box/
├── package.json      # manifeste Electron
├── main.js           # processus principal Electron
├── index.html        # UI + CSS glassmorphism
├── renderer.js       # moteur 3D + physique
└── README.md
```

---

Fait avec ❤️ et beaucoup de rouge.
