# Oganesson Box

Visualiseur scientifique sobre pour explorer des atomes d'oganesson-294 dans une boite d'interaction pedagogique.

Sober scientific visualizer for exploring oganesson-294 atoms inside a pedagogical interaction box.

---

## Francais

### Objectif

Oganesson Box est une application de bureau Electron + Three.js qui visualise plusieurs atomes de `294Og` en 3D. Le projet ne pretend pas calculer la chimie reelle de l'oganesson. Il construit plutot une scene educative, lisible et documentee qui rend visible:

- la boite d'interaction entre atomes;
- le noyau complet de chaque atome: `118` protons et `176` neutrons;
- les `118` electrons repartis sur les couches `2, 8, 18, 32, 32, 18, 8`;
- les quarks de valence de tous les nucleons: `uud` pour chaque proton, `udd` pour chaque neutron;
- un modele interatomique de type Lennard-Jones adouci, utilise comme approximation visuelle.

### Installation

Prerequis:

- Node.js recent;
- npm;
- Windows, macOS ou Linux avec support WebGL;
- aucune connexion internet au lancement: Three.js est installe localement.

```bash
npm install
npm start
```

Verification syntaxique:

```bash
npm run check
```

### Utilisation

| Action | Effet |
|---|---|
| Glisser la souris | Orbiter autour de la boite |
| Molette | Zoomer vers les niveaux de detail |
| `Og-294 atoms` | Changer le nombre d'atomes simules |
| `Thermal agitation` | Modifier l'agitation aleatoire |
| `LJ interaction strength` | Modifier l'intensite du potentiel interatomique |
| `Particle contrast` | Modifier la lisibilite des particules |
| `Regenerate positions` | Reinitialiser les positions |

Le zoom controle le niveau de detail:

1. `Atoms`: enveloppes atomiques et mouvement global.
2. `Electron shells`: couches et electrons.
3. `Nucleons`: protons et neutrons dans le noyau.
4. `Quarks`: quarks `up` et `down` pour tous les nucleons.

### Modele scientifique

#### Inventaire Og-294

Le modele utilise l'isotope `294Og`:

- numero atomique `Z = 118`;
- nombre de masse `A = 294`;
- neutrons `N = A - Z = 176`;
- atome neutre: `118` electrons;
- protons: `118 x uud`, donc `236` quarks up et `118` quarks down;
- neutrons: `176 x udd`, donc `176` quarks up et `352` quarks down;
- total par atome: `412` quarks up, `470` quarks down, `882` quarks.

Chaque atome contient donc `1 294` particules subatomiques visibles au niveau de detail maximal:

```text
118 protons + 176 neutrons + 118 electrons + 882 quarks = 1 294 particules
```

#### Electrons

Les electrons sont repartis selon la configuration en couches `2, 8, 18, 32, 32, 18, 8`, equivalente a la configuration electronique de periode 7:

```text
[Rn] 5f14 6d10 7s2 7p6
```

Les trajectoires affichees sont des guides visuels. Elles ne sont pas des orbitales quantiques calculees. Pour l'oganesson, les effets relativistes sont importants et les etudes theoriques suggerent un comportement electronique plus delocalise que celui des gaz nobles plus legers.

#### Noyau et quarks

Les nucleons sont places dans un volume compact afin de rendre la structure lisible. Les quarks sont affiches comme constituants de valence:

- proton: `uud`;
- neutron: `udd`.

Le rendu ne modelise pas la chromodynamique quantique, le confinement, les gluons, les spins, ni les distributions de densite nucleaire reelles. Il s'agit d'une representation structurale.

#### Interactions entre atomes

Le mouvement entre atomes utilise un potentiel de Lennard-Jones adouci:

```text
F(r) = 24 epsilon / r * (2(sigma/r)^12 - (sigma/r)^6)
```

Ce choix donne une repulsion courte portee et une attraction faible a distance intermediaire. Il est utile pour une scene interactive, mais il ne remplace pas une simulation relativiste, quantique ou ab initio de l'oganesson.

### Limites importantes

- Les distances et tailles ne sont pas a l'echelle.
- Les electrons ne suivent pas de vraies orbitales quantiques.
- Les quarks sont representes comme particules localisees pour la lisibilite.
- La chimie de l'oganesson n'a pas ete mesuree comme celle des elements stables; beaucoup de proprietes sont predites.
- Le potentiel de Lennard-Jones est pedagogique et non calibre sur des parametres experimentaux Og-Og.

### Architecture

```text
oganesson-box/
├── index.html          # interface sobre, panneaux, importmap Three.js local
├── main.js             # processus principal Electron securise
├── renderer.js         # scene Three.js, instancing, physique, niveaux de detail
├── package.json        # scripts npm et dependances
├── package-lock.json   # verrouillage npm
├── LICENSE             # licence MIT
└── README.md           # documentation bilingue
```

Le rendu subatomique utilise `THREE.InstancedMesh` afin d'afficher des milliers de particules sans creer un mesh individuel pour chaque proton, neutron, electron ou quark.

### Sources scientifiques

- Royal Society of Chemistry, [Oganesson - Element information](https://periodic-table.rsc.org/element/118/oganesson).
- IUPAC, [Periodic Table of the Elements](https://iupac.org/what-we-do/periodic-table-of-elements/).
- Jerabek, Schuetrumpf, Schwerdtfeger, Nazarewicz, [Electron and Nucleon Localization Functions of Oganesson](https://link.aps.org/doi/10.1103/PhysRevLett.120.053001), Physical Review Letters 120, 053001.
- Smits, Mewes, Jerabek, Schwerdtfeger, [Oganesson: A Noble Gas Element That Is Neither Noble Nor a Gas](https://onlinelibrary.wiley.com/doi/10.1002/anie.202011976), Angewandte Chemie International Edition.

---

## English

### Goal

Oganesson Box is an Electron + Three.js desktop application for visualizing several `294Og` atoms in 3D. The project does not claim to compute real oganesson chemistry. It provides a documented educational scene that makes the following structures visible:

- a bounded atom interaction box;
- the complete nucleus of each atom: `118` protons and `176` neutrons;
- `118` electrons distributed over shells `2, 8, 18, 32, 32, 18, 8`;
- the valence quark content of every nucleon: `uud` for each proton, `udd` for each neutron;
- a softened Lennard-Jones-style interatomic model used as a visual approximation.

### Installation

Requirements:

- recent Node.js;
- npm;
- Windows, macOS, or Linux with WebGL support;
- no internet connection at launch: Three.js is installed locally.

```bash
npm install
npm start
```

Syntax check:

```bash
npm run check
```

### Usage

| Action | Effect |
|---|---|
| Mouse drag | Orbit around the box |
| Mouse wheel | Zoom through detail levels |
| `Og-294 atoms` | Change simulated atom count |
| `Thermal agitation` | Change random thermal motion |
| `LJ interaction strength` | Change interatomic potential intensity |
| `Particle contrast` | Improve or soften particle visibility |
| `Regenerate positions` | Reset atom positions |

Zoom controls the level of detail:

1. `Atoms`: atomic envelopes and global motion.
2. `Electron shells`: electron shells and electrons.
3. `Nucleons`: protons and neutrons in the nucleus.
4. `Quarks`: up and down quarks for every nucleon.

### Scientific Model

#### Og-294 Inventory

The model uses isotope `294Og`:

- atomic number `Z = 118`;
- mass number `A = 294`;
- neutrons `N = A - Z = 176`;
- neutral atom: `118` electrons;
- protons: `118 x uud`, therefore `236` up quarks and `118` down quarks;
- neutrons: `176 x udd`, therefore `176` up quarks and `352` down quarks;
- total per atom: `412` up quarks, `470` down quarks, `882` quarks.

Each atom therefore contains `1,294` visible subatomic particles at maximum detail:

```text
118 protons + 176 neutrons + 118 electrons + 882 quarks = 1,294 particles
```

#### Electrons

Electrons are distributed by shell occupancy `2, 8, 18, 32, 32, 18, 8`, corresponding to the period-7 electron configuration:

```text
[Rn] 5f14 6d10 7s2 7p6
```

The rendered paths are visual guides, not computed quantum orbitals. For oganesson, relativistic effects are central, and theoretical work suggests more delocalized electronic behavior than in lighter noble gases.

#### Nucleus And Quarks

Nucleons are placed in a compact volume to keep the structure readable. Quarks are shown as valence constituents:

- proton: `uud`;
- neutron: `udd`.

The rendering does not model quantum chromodynamics, confinement, gluons, spin, or real nuclear density distributions. It is a structural representation.

#### Interatomic Interactions

Atoms move under a softened Lennard-Jones force:

```text
F(r) = 24 epsilon / r * (2(sigma/r)^12 - (sigma/r)^6)
```

This creates short-range repulsion and weak medium-range attraction. It is useful for an interactive scene, but it is not a substitute for relativistic, quantum, or ab initio oganesson simulation.

### Important Limits

- Distances and particle sizes are not to scale.
- Electrons do not follow real quantum orbitals.
- Quarks are localized for readability.
- Oganesson chemistry has not been measured like stable elements; many properties are predicted.
- The Lennard-Jones potential is pedagogical and not calibrated against experimental Og-Og parameters.

### Architecture

```text
oganesson-box/
├── index.html          # sober interface, panels, local Three.js importmap
├── main.js             # hardened Electron main process
├── renderer.js         # Three.js scene, instancing, physics, detail levels
├── package.json        # npm scripts and dependencies
├── package-lock.json   # npm lockfile
├── LICENSE             # MIT license
└── README.md           # bilingual documentation
```

The subatomic renderer uses `THREE.InstancedMesh` to display thousands of particles without creating one standalone mesh per proton, neutron, electron, or quark.

### Scientific Sources

- Royal Society of Chemistry, [Oganesson - Element information](https://periodic-table.rsc.org/element/118/oganesson).
- IUPAC, [Periodic Table of the Elements](https://iupac.org/what-we-do/periodic-table-of-elements/).
- Jerabek, Schuetrumpf, Schwerdtfeger, Nazarewicz, [Electron and Nucleon Localization Functions of Oganesson](https://link.aps.org/doi/10.1103/PhysRevLett.120.053001), Physical Review Letters 120, 053001.
- Smits, Mewes, Jerabek, Schwerdtfeger, [Oganesson: A Noble Gas Element That Is Neither Noble Nor a Gas](https://onlinelibrary.wiley.com/doi/10.1002/anie.202011976), Angewandte Chemie International Edition.

### Roadmap

- Add optional labels for a selected atom.
- Add a performance mode that keeps all atoms complete internally but renders quarks only for a selected atom.
- Add screenshots or a short demo clip to the GitHub repository.
- Add automated visual smoke tests for the Electron window.
