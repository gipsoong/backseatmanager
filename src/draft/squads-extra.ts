/**
 * More club-seasons for every league (session 37): mid-table and smaller sides, so a draft's
 * league isn't the same twenty clubs every time. Kept in a file of their own and added after
 * every other pool, as saves refer to pools by index (`p<pool>-<i>` ids). Same line format and
 * standard as squads.ts: overalls are our estimate of the FIFA rating that season.
 */
import type { Archetype } from '../engine/index.ts'
import { kit, pool, type League, type Pool } from './squads.ts'

const STOKE = kit('#d71f30', '#ffffff', 'red')
const FULHAM = kit('#f2f2ee', '#111111', 'white')
const NORWICH = kit('#fff200', '#00a650', 'yellow')
const WBA = kit('#122f67', '#ffffff', 'blue')
const SUNDERLAND = kit('#e2231a', '#111111', 'red')
const HULL = kit('#f5a12d', '#111111', 'orange')
const SOUTHAMPTON = kit('#d71920', '#ffffff', 'red')
const BOURNEMOUTH = kit('#c8102e', '#111111', 'red')
const WATFORD = kit('#fbee23', '#ed2127', 'yellow')
const BRENTFORD = kit('#e30613', '#ffffff', 'red')

const VILLARREAL = kit('#ffe667', '#004f9f', 'yellow')
const ALAVES = kit('#1d4f9c', '#ffffff', 'blue')
const LEGANES = kit('#f2f2ee', '#1d4f9c', 'white')
const MALAGA = kit('#7ab4e0', '#ffffff', 'blue')
const CADIZ = kit('#ffd700', '#1d4f9c', 'yellow')
const CELTA = kit('#8ac3ee', '#ffffff', 'blue')
const GETAFE = kit('#005999', '#ffffff', 'blue')
const SEVILLA = kit('#f4f4f0', '#d2152b', 'white')
const VALENCIA = kit('#f4f4f0', '#111111', 'white')

const BMG = kit('#f2f2ee', '#1a1a1a', 'white')
const SVW = kit('#1d9053', '#ffffff', 'green')
const M05 = kit('#c3141e', '#ffffff', 'red')
const F95 = kit('#d8151f', '#ffffff', 'red')
const DSC = kit('#1a1a1a', '#ffffff', 'black')
const BOCHUM = kit('#005ca9', '#ffffff', 'blue')

const CATANIA = kit('#1d3f9a', '#d0102b', 'blue')
const GENOA = kit('#9b1b30', '#1b2a4a', 'red')
const TORINO = kit('#7a1f2b', '#ffffff', 'red')
const SASSUOLO = kit('#1a7a3c', '#232527', 'green')
const VIOLA = kit('#5b2a86', '#ffffff', 'purple')
const UDINESE = kit('#232527', '#f2f2ee', 'black')

const BORDEAUX = kit('#1a2340', '#ffffff', 'blue')
const LILLE = kit('#d0102b', '#ffffff', 'red')
const NICE = kit('#c8102e', '#111111', 'red')
const RENNES = kit('#d81e2a', '#111111', 'red')

const of = (league: League, pools: Pool[]): Pool[] => pools.map((p) => ({ ...p, league }))

const PREMIER_LEAGUE: Pool[] = [
  pool('Stoke City', 'STK', '2010/11', STOKE, '4-4-2', `
    Asmir Begović, GK, 75
    Thomas Sørensen, GK, 74
    Ryan Shawcross, CB, 77
    Robert Huth, CB, 77
    Abdoulaye Faye, CB, 74
    Danny Higginbotham, CB/FB, 72
    Danny Collins, FB/CB, 73
    Andy Wilkinson, FB, 70
    Marc Wilson, FB/CM, 72
    Glenn Whelan, CM/DM, 74
    Rory Delap, CM, 72
    Dean Whitehead, CM, 73
    Salif Diao, DM, 68
    Jermaine Pennant, WM, 75
    Matthew Etherington, WM, 76
    Tuncay Şanlı, ST/CM, 74, Tuncay
    Jon Walters, ST/WM, 73
    Kenwyne Jones, ST, 75
    Ricardo Fuller, ST, 73
    Eiður Guðjohnsen, ST, 75, Guðjohnsen
  `),
  pool('Fulham', 'FUL', '2011/12', FULHAM, '4-4-2', `
    Mark Schwarzer, GK, 79
    David Stockdale, GK, 70
    Brede Hangeland, CB, 79
    Aaron Hughes, CB, 75
    Philippe Senderos, CB, 74
    John Arne Riise, FB, 75
    Chris Baird, FB/CB, 72
    Stephen Kelly, FB, 70
    Danny Murphy, CM, 77
    Dickson Etuhu, DM, 73
    Mahamadou Diarra, DM, 75
    Steve Sidwell, CM, 73
    Mousa Dembélé, CM/ST, 79
    Damien Duff, WM, 76
    Clint Dempsey, CM/ST, 80
    Bryan Ruiz, CM/W, 78
    Kerim Frei, W, 66
    Pavel Pogrebnyak, ST, 76
    Andrew Johnson, ST, 74
    Bobby Zamora, ST, 75
  `),
  pool('Norwich City', 'NOR', '2011/12', NORWICH, '4-4-2', `
    John Ruddy, GK, 74
    Declan Rudd, GK, 64
    Russell Martin, FB/CB, 72
    Zak Whitbread, CB, 70
    Leon Barnett, CB, 70
    Daniel Ayala, CB, 68
    Elliott Ward, CB, 69
    Marc Tierney, FB, 70
    Adam Drury, FB, 69
    Kyle Naughton, FB, 72
    Bradley Johnson, CM, 72
    Andrew Crofts, CM, 71
    David Fox, CM, 70
    Wes Hoolahan, CM, 75
    Anthony Pilkington, WM, 72
    Elliott Bennett, WM, 71
    Grant Holt, ST, 75
    Steve Morison, ST, 72
    Simeon Jackson, ST, 70
    Aaron Wilbraham, ST, 66
  `),
  pool('West Bromwich Albion', 'WBA', '2012/13', WBA, '4-2-3-1', `
    Ben Foster, GK, 79
    Boaz Myhill, GK, 73
    Jonas Olsson, CB, 76
    Gareth McAuley, CB, 76
    Liam Ridgewell, CB/FB, 74
    Steven Reid, FB, 71
    Billy Jones, FB, 72
    Goran Popov, FB, 70
    Claudio Yacob, DM, 75
    Youssouf Mulumbu, CM, 76
    James Morrison, CM, 75
    Chris Brunt, WM/CM, 76
    Graham Dorrans, CM, 72
    Zoltán Gera, CM, 73
    Jerome Thomas, WM, 70
    Somen Tchoyi, WM, 70
    Romelu Lukaku, ST, 78
    Peter Odemwingie, ST, 76
    Shane Long, ST, 75
    Markus Rosenberg, ST, 72
  `),
  pool('Southampton', 'SOU', '2013/14', SOUTHAMPTON, '4-2-3-1', `
    Artur Boruc, GK, 77
    Kelvin Davis, GK, 68
    Dejan Lovren, CB, 78
    José Fonte, CB, 77
    Jos Hooiveld, CB, 70
    Nathaniel Clyne, FB, 75
    Luke Shaw, FB, 74
    Calum Chambers, FB, 68
    Danny Fox, FB, 69
    Morgan Schneiderlin, DM, 79
    Victor Wanyama, DM, 77
    Steven Davis, CM, 76
    Jack Cork, CM, 73
    James Ward-Prowse, CM, 70
    Gastón Ramírez, CM, 74
    Adam Lallana, CM/W, 80
    Guly do Prado, W, 72
    Jay Rodriguez, ST/W, 78
    Rickie Lambert, ST, 77
    Pablo Osvaldo, ST, 77
  `),
  pool('Sunderland', 'SUN', '2013/14', SUNDERLAND, '4-3-3', `
    Vito Mannone, GK, 74
    Keiren Westwood, GK, 72
    John O’Shea, CB, 76
    Wes Brown, CB, 73
    Valentin Roberge, CB, 70
    Santiago Vergini, CB, 70
    Phil Bardsley, FB, 73
    Andrea Dossena, FB, 71
    Marcos Alonso, FB, 72
    Lee Cattermole, DM, 74
    Liam Bridcutt, DM, 72
    Ki Sung-yueng, CM, 76
    Sebastian Larsson, CM/WM, 75
    Jack Colback, CM, 73
    Craig Gardner, CM, 73
    Emanuele Giaccherini, WM/CM, 76
    Adam Johnson, WM, 77
    Fabio Borini, ST/W, 76
    Steven Fletcher, ST, 74
    Jozy Altidore, ST, 73
    Connor Wickham, ST, 71
  `),
  pool('Hull City', 'HUL', '2013/14', HULL, '3-5-2', `
    Allan McGregor, GK, 76
    Steve Harper, GK, 70
    Curtis Davies, CB, 75
    James Chester, CB, 73
    Alex Bruce, CB, 70
    Maynor Figueroa, CB/FB, 72
    Ahmed Elmohamady, WM/FB, 73
    Liam Rosenior, FB, 70
    Robbie Brady, FB/WM, 70
    Jake Livermore, CM, 74
    Tom Huddlestone, CM, 76
    David Meyler, CM, 70
    Stephen Quinn, CM, 70
    Robert Koren, CM, 72
    George Boyd, WM, 70
    Sone Aluko, W, 71
    Shane Long, ST, 75
    Nikica Jelavić, ST, 75
    Yannick Sagbo, ST, 70
    Danny Graham, ST, 70
  `),
  pool('Bournemouth', 'BOU', '2016/17', BOURNEMOUTH, '4-4-2', `
    Artur Boruc, GK, 76
    Adam Federici, GK, 70
    Steve Cook, CB, 76
    Nathan Aké, CB, 76
    Tyrone Mings, CB, 70
    Simon Francis, FB, 73
    Charlie Daniels, FB, 75
    Adam Smith, FB, 75
    Harry Arter, CM, 77
    Andrew Surman, CM, 74
    Dan Gosling, CM, 72
    Jack Wilshere, CM, 78
    Marc Pugh, WM, 72
    Junior Stanislas, WM, 74
    Ryan Fraser, WM, 73
    Jordon Ibe, W, 75
    Joshua King, ST, 77, King
    Benik Afobe, ST, 75
    Callum Wilson, ST, 76
    Lys Mousset, ST, 66
  `),
  pool('Watford', 'WAT', '2018/19', WATFORD, '4-4-2', `
    Ben Foster, GK, 78
    Heurelho Gomes, GK, 76
    Craig Cathcart, CB, 75
    Christian Kabasele, CB, 74
    Craig Dawson, CB, 74
    Sebastian Prödl, CB, 74
    José Holebas, FB, 76
    Kiko Femenía, FB, 75
    Daryl Janmaat, FB, 75
    Abdoulaye Doucouré, CM, 80
    Étienne Capoue, DM, 79
    Will Hughes, CM, 76
    Tom Cleverley, CM, 74
    Nathaniel Chalobah, CM, 72
    Domingos Quina, CM, 68
    Roberto Pereyra, CM/W, 79
    Gerard Deulofeu, W/ST, 79
    Ken Sema, WM, 70
    Troy Deeney, ST, 77
    Andre Gray, ST, 75
    Isaac Success, ST, 72
  `),
  pool('Brentford', 'BRE', '2021/22', BRENTFORD, '3-5-2', `
    David Raya, GK, 78
    Álvaro Fernández, GK, 72
    Ethan Pinnock, CB, 75
    Pontus Jansson, CB, 76
    Kristoffer Ajer, CB, 75
    Mads Bech Sørensen, CB, 68
    Rico Henry, FB, 75
    Mads Roerslev, FB, 70
    Christian Nørgaard, DM, 77
    Vitaly Janelt, CM, 73
    Mathias Jensen, CM, 74
    Frank Onyeka, CM, 72
    Christian Eriksen, CM, 82
    Shandon Baptiste, CM, 70
    Saman Ghoddos, CM, 72
    Sergi Canós, WM/W, 74
    Bryan Mbeumo, W/ST, 77
    Yoane Wissa, ST, 75
    Ivan Toney, ST, 77
    Marcus Forss, ST, 68
  `),
  pool('Fulham', 'FUL', '2023/24', FULHAM, '4-2-3-1', `
    Bernd Leno, GK, 81
    Marek Rodák, GK, 72
    Tosin Adarabioyo, CB, 76
    Calvin Bassey, CB/FB, 76
    Issa Diop, CB, 75
    Tim Ream, CB, 75
    Antonee Robinson, FB, 77
    Kenny Tete, FB, 75
    Timothy Castagne, FB, 77
    João Palhinha, DM, 84
    Harrison Reed, CM, 74
    Saša Lukić, CM, 74
    Tom Cairney, CM, 74
    Andreas Pereira, CM, 77
    Alex Iwobi, W/CM, 77
    Harry Wilson, W, 75
    Willian, W, 76
    Adama Traoré, W, 76
    Bobby De Cordova-Reid, W, 73
    Raúl Jiménez, ST, 75
    Rodrigo Muniz, ST, 72
    Carlos Vinícius, ST, 73
  `),
  pool('Bournemouth', 'BOU', '2024/25', BOURNEMOUTH, '4-2-3-1', `
    Kepa Arrizabalaga, GK, 80, Kepa
    Mark Travers, GK, 70
    Illia Zabarnyi, CB, 79
    Dean Huijsen, CB, 77
    Marcos Senesi, CB, 78
    James Hill, CB, 68
    Milos Kerkez, FB, 79
    Adam Smith, FB, 73
    Julián Araujo, FB, 72
    Lewis Cook, DM, 76
    Tyler Adams, DM, 78
    Ryan Christie, CM, 75
    Alex Scott, CM, 74
    Hamed Traorè, CM, 74
    Marcus Tavernier, W/CM, 77
    Antoine Semenyo, W, 78
    Justin Kluivert, W, 78
    Dango Ouattara, W, 76
    Luis Sinisterra, W, 77
    David Brooks, W, 73
    Evanilson, ST, 79
    Enes Ünal, ST, 75
  `),
]

const LA_LIGA: Pool[] = [
  pool('Villarreal', 'VIL', '2015/16', VILLARREAL, '4-4-2', `
    Sergio Asenjo, GK, 78
    Alphonse Areola, GK, 77
    Mateo Musacchio, CB, 80
    Víctor Ruiz, CB, 79
    Eric Bailly, CB, 77
    Mario Gaspar, FB, 76
    Jaume Costa, FB, 77
    Antonio Rukavina, FB, 75
    Bruno Soriano, DM, 82
    Manu Trigueros, CM, 78
    Tomás Pina, CM, 75
    Jonathan dos Santos, CM, 76
    Denis Suárez, CM/W, 77
    Samu Castillejo, W, 74
    Roberto Soldado, ST, 79
    Cédric Bakambu, ST, 77
    Léo Baptistão, ST, 74
    Adrián López, ST, 76
    Samuel García, W, 70
  `),
  pool('Sevilla', 'SEV', '2013/14', SEVILLA, '4-2-3-1', `
    Beto, GK, 79
    Javi Varas, GK, 74
    Federico Fazio, CB, 78
    Nicolás Pareja, CB, 78
    Daniel Carriço, CB/DM, 75
    Alberto Botía, CB, 74
    Coke, FB, 76
    Alberto Moreno, FB, 76
    Fernando Navarro, FB, 75
    Diogo Figueiras, FB, 72
    Stéphane M’Bia, DM/CB, 78
    Vicente Iborra, CM, 77
    Ivan Rakitić, CM, 83
    José Antonio Reyes, W, 78
    Vitolo, W, 77
    Marko Marin, W, 76
    Diego Perotti, W, 76
    Kevin Gameiro, ST, 79
    Carlos Bacca, ST, 79
  `),
  pool('Valencia', 'VAL', '2014/15', VALENCIA, '4-3-3', `
    Diego Alves, GK, 82
    Yoel Rodríguez, GK, 72, Yoel
    Nicolás Otamendi, CB, 81
    Shkodran Mustafi, CB, 78
    Lucas Orbán, FB, 73
    Antonio Barragán, FB, 74
    José Luis Gayà, FB, 77
    João Cancelo, FB, 72
    Dani Parejo, CM, 81
    André Gomes, CM, 78
    Enzo Pérez, CM, 80
    Javi Fuego, DM, 76
    Rodrigo De Paul, CM, 70
    Sofiane Feghouli, W, 79
    Pablo Piatti, W, 77
    Carles Gil, W, 72
    Rodrigo Moreno, ST/W, 76, Rodrigo
    Paco Alcácer, ST, 77
    Álvaro Negredo, ST, 79
  `),
  pool('Málaga', 'MAL', '2014/15', MALAGA, '4-4-2', `
    Carlos Kameni, GK, 78
    Willy Caballero, GK, 77
    Weligton, CB, 74
    Marcos Angeleri, CB, 72
    Sergio Sánchez, CB, 72
    Miguel Torres, FB, 73
    Arthur Boka, FB, 72
    Ignacio Camacho, DM, 77
    Recio, CM, 74
    Sergi Darder, CM, 74
    Duda, CM, 74
    Luis Alberto, CM, 74
    Samu Castillejo, W, 74
    Nordin Amrabat, W, 76
    Pablo Pérez, W, 70
    Roque Santa Cruz, ST, 74
    Juanmi, ST, 74
    Javier Guerra, ST, 68
    Ricardo Horta, W, 72
  `),
  pool('Alavés', 'ALA', '2016/17', ALAVES, '4-4-2', `
    Fernando Pacheco, GK, 76
    Antonio Sivera, GK, 66
    Víctor Laguardia, CB, 75
    Alexis Ruano, CB, 76
    Rodrigo Ely, CB, 72
    Kiko Femenía, FB, 74
    Theo Hernández, FB, 74
    Carlos Vigaray, FB, 68
    Marcos Llorente, DM, 77
    Manu García, CM, 74
    Daniel Torres, DM, 74
    Víctor Camarasa, CM, 74
    Óscar Romero, CM, 72
    Ibai Gómez, W, 75
    Edgar Méndez, W, 72
    Hernán Pérez, W, 72
    Deyverson, ST, 73
    Christian Santos, ST, 72
    Zou Feddal, CB, 72
  `),
  pool('Leganés', 'LEG', '2017/18', LEGANES, '4-4-2', `
    Iván Cuéllar, GK, 77
    Nereo Champagne, GK, 72
    Unai Bustinza, CB/FB, 74
    Dimitrios Siovas, CB, 75
    Martín Mantovani, CB, 73
    Rodrigo Tarín, CB, 72
    Diego Rico, FB, 74
    Javier Muñoz, FB, 70
    Rubén Pérez, DM, 74
    Gabriel Pires, CM, 74
    Javier Eraso, CM, 73
    Darko Brašanac, CM, 72
    Alexander Szymanowski, W, 73
    Nabil El Zhar, W, 72
    Claudio Beauvue, ST, 72
    Guido Carrillo, ST, 74
    Miguel Ángel Guerrero, ST, 73
    Gerard Gumbau, CM, 70
    Joseba Zaldúa, FB, 72
  `),
  pool('Cádiz', 'CAD', '2020/21', CADIZ, '4-4-2', `
    Jeremías Ledesma, GK, 75
    David Gil, GK, 70
    Juan Cala, CB, 72
    Marcos Mauro, CB, 72
    Fali, CB, 73
    Sergio González, CB, 72
    Alfonso Espino, FB, 73
    Carlos Akapo, FB, 70
    Iza Carcelén, FB, 70
    José Mari, CM, 72
    Jens Jønsson, DM, 72
    Augusto Fernández, CM, 72
    Álex Fernández, CM, 74
    Salvi Sánchez, WM, 73
    Iván Alejo, W, 73
    Rubén Sobrino, W, 72
    Jairo Izquierdo, W, 70
    Álvaro Negredo, ST, 75
    Anthony Lozano, ST, 72
  `),
  pool('Celta Vigo', 'CEL', '2022/23', CELTA, '4-4-2', `
    Agustín Marchesín, GK, 76
    Iván Villar, GK, 70
    Joseph Aidoo, CB, 75
    Unai Núñez, CB, 75
    Carlos Domínguez, CB, 70
    Javi Galán, FB, 76
    Óscar Mingueza, FB, 74
    Kevin Vázquez, FB, 70
    Hugo Mallo, FB, 74
    Renato Tapia, DM, 77
    Fran Beltrán, CM, 76
    Gabri Veiga, CM, 76
    Luca de la Torre, CM, 72
    Óscar Rodríguez, CM, 74
    Franco Cervi, W, 74
    Carles Pérez, W, 73
    Williot Swedberg, W, 69
    Iago Aspas, ST, 82
    Gonçalo Paciência, ST, 72
    Jørgen Strand Larsen, ST, 74
  `),
  pool('Getafe', 'GET', '2023/24', GETAFE, '4-4-2', `
    David Soria, GK, 78
    Daniel Fuzato, GK, 68
    Dakonam Djené, CB, 79, Djené
    Omar Alderete, CB, 76
    Domingos Duarte, CB, 76
    Gastón Álvarez, CB, 73
    Juan Iglesias, FB, 74
    Damián Suárez, FB, 74
    Diego Rico, FB, 73
    Mauro Arambarri, DM, 77
    Nemanja Maksimović, CM, 77
    Luis Milla, CM, 77
    Carles Aleñá, CM, 75
    Portu, W, 74
    Mason Greenwood, W, 78
    Borja Mayoral, ST, 77
    Jaime Mata, ST, 73
    Juanmi Latasa, ST, 70
    Stefan Mitrović, CB, 72
  `),
]

const BUNDESLIGA: Pool[] = [
  pool('Borussia Mönchengladbach', 'BMG', '2011/12', BMG, '4-4-2', `
    Marc-André ter Stegen, GK, 75
    Christofer Heimeroth, GK, 68
    Dante, CB, 79
    Martin Stranzl, CB, 77
    Roel Brouwers, CB, 72
    Tony Jantschke, FB, 72
    Filip Daems, FB, 72
    Oscar Wendt, FB, 73
    Roman Neustädter, DM, 76
    Håvard Nordtveit, DM, 73
    Thorben Marx, CM, 70
    Lukas Rupp, CM, 66
    Patrick Herrmann, W, 76
    Juan Arango, WM, 78
    Marco Reus, W/CM, 82
    Mike Hanke, ST, 73
    Igor de Camargo, ST, 72
    Raúl Bobadilla, ST, 70
    Tolga Ciğerci, CM, 66
  `),
  pool('Werder Bremen', 'SVW', '2015/16', SVW, '4-3-3', `
    Felix Wiedwald, GK, 72
    Jaroslav Drobný, GK, 74
    Jannik Vestergaard, CB, 75
    Assani Lukimya, CB, 72
    Alejandro Gálvez, CB, 72
    Luca Caldirola, CB, 71
    Theodor Gebre Selassie, FB, 74
    Santiago García, FB, 73
    Ulisses Garcia, FB, 68
    Clemens Fritz, CM, 74
    Philipp Bargfrede, DM, 73
    Zlatko Junuzović, CM, 77
    Levin Öztunalı, CM, 73
    Florian Grillitsch, CM, 70
    Fin Bartels, W, 74
    Anthony Ujah, ST, 75
    Claudio Pizarro, ST, 77
    Aron Jóhannsson, ST, 70
    Lennart Thy, ST, 66
  `),
  pool('Mainz 05', 'M05', '2016/17', M05, '4-2-3-1', `
    Jonas Lössl, GK, 75
    Jannik Huth, GK, 64
    Stefan Bell, CB, 75
    Alexander Hack, CB, 71
    Niko Bungert, CB, 71
    Léon Balogun, CB, 71
    Daniel Brosinski, FB, 73
    Gaëtan Bussmann, FB, 70
    Giulio Donati, FB, 73
    Jean-Philippe Gbamin, DM, 76
    Danny Latza, CM, 71
    Fabian Frei, CM, 73
    Yunus Mallı, CM, 78
    Levin Öztunalı, CM, 74
    Pablo de Blasis, W, 73
    Jairo Samperio, W, 73
    Bojan Krkić, W, 74, Bojan
    Jhon Córdoba, ST, 73
    Yoshinori Mutō, ST, 75
    Karim Onisiwo, ST, 70
  `),
  pool('Fortuna Düsseldorf', 'F95', '2018/19', F95, '4-1-4-1', `
    Michael Rensing, GK, 72
    Raphael Wolf, GK, 68
    Kaan Ayhan, CB, 74
    Andre Hoffmann, CB, 72
    Marcin Kamiński, CB, 71
    Niko Gießelmann, FB, 72
    Matthias Zimmermann, FB, 71
    Jean Zimmer, FB, 71
    Diego Contento, FB, 70
    Adam Bodzek, DM, 70
    Marcel Sobottka, CM, 72
    Kevin Stöger, CM, 72
    Oliver Fink, CM, 71
    Alfredo Morales, CM, 71
    Dodi Lukébakio, W, 76
    Kenan Karaman, W, 71
    Benito Raman, ST, 74
    Rouwen Hennings, ST, 73
    Dawid Kownacki, ST, 70
  `),
  pool('Arminia Bielefeld', 'DSC', '2020/21', DSC, '4-1-4-1', `
    Stefan Ortega, GK, 76
    Oscar Linnér, GK, 66
    Amos Pieper, CB, 72
    Joakim Nilsson, CB, 71
    Mike van der Hoorn, CB, 71
    Nathan de Medina, CB, 69
    Cedric Brunner, FB, 70
    Jacob Laursen, FB, 69
    Anderson Lucoqui, FB, 68
    Manuel Prietl, DM, 72
    Fabian Kunze, CM, 70
    Arne Maier, CM, 73
    Masaya Okugawa, W, 73
    Ritsu Dōan, W, 74
    Christian Gebauer, W, 68
    Fabian Klos, ST, 72
    Sergio Córdova, ST, 70
    Andreas Voglsammer, ST, 69
    Marcel Hartel, CM, 70
  `),
  pool('VfL Bochum', 'BOC', '2022/23', BOCHUM, '4-3-3', `
    Manuel Riemann, GK, 76
    Michael Esser, GK, 68
    Erhan Mašović, CB, 72
    Ivan Ordets, CB, 72
    Keven Schlotterbeck, CB, 72
    Dominique Heintz, CB, 72
    Danilo Soares, FB, 72
    Cristian Gamboa, FB, 72
    Saidy Janko, FB, 70
    Anthony Losilla, DM, 72
    Jacek Góralski, DM, 71
    Kevin Stöger, CM, 74
    Patrick Osterhage, CM, 70
    Philipp Förster, CM, 71
    Takuma Asano, W/ST, 74
    Gerrit Holtmann, W, 72
    Christopher Antwi-Adjei, W, 71
    Philipp Hofmann, ST, 73
    Simon Zoller, ST, 70
    Moritz Broschinski, ST, 66
  `),
]

const SERIE_A: Pool[] = [
  pool('Udinese', 'UDI', '2012/13', UDINESE, '3-5-2', `
    Željko Brkić, GK, 76
    Daniele Padelli, GK, 70
    Danilo Larangeira, CB, 76, Danilo
    Thomas Heurtaux, CB, 74
    Maurizio Domizzi, CB, 73
    Dušan Basta, FB, 74
    Gabriel Silva, FB, 72
    Giovanni Pasquale, FB, 72
    Giampiero Pinzi, CM, 73
    Allan, CM, 74
    Emmanuel Agyemang-Badu, CM, 74
    Roberto Pereyra, CM, 76
    Andrea Lazzari, CM, 72
    Maicosuel, W, 72
    Antonio Di Natale, ST, 83
    Luis Muriel, ST, 76
    Mathías Ranégie, ST, 70
    Nicolás López, ST, 70
    Ryder Matos, ST, 66
  `),
  pool('Catania', 'CAT', '2012/13', CATANIA, '4-3-3', `
    Mariano Andújar, GK, 76
    Alberto Frison, GK, 66
    Nicolás Spolli, CB, 74
    Nicola Legrottaglie, CB, 73
    Giuseppe Bellusci, CB, 70
    Pablo Álvarez, FB, 72
    Giovanni Marchese, FB, 73
    Ciro Capuano, FB, 70
    Gino Peruzzi, FB, 70
    Francesco Lodi, CM, 75
    Sergio Almirón, CM, 73
    Fabián Rinaudo, DM, 72
    Marco Biagianti, CM, 72
    Mariano Izco, CM, 72
    Lucas Castro, CM, 74
    Pablo Barrientos, W/CM, 76
    Alejandro Gómez, W/ST, 77
    Gonzalo Bergessio, ST, 76
    Keko, W, 70
  `),
  pool('Genoa', 'GEN', '2018/19', GENOA, '3-5-2', `
    Federico Marchetti, GK, 75
    Ionuț Radu, GK, 72
    Cristian Romero, CB, 72
    Davide Biraschi, CB, 73
    Ervin Zukanović, CB, 72
    Koray Günter, CB, 70
    Domenico Criscito, FB, 76
    Pedro Pereira, FB, 70
    Ivan Radovanović, DM, 72
    Miguel Veloso, CM, 74
    Stefano Sturaro, CM, 74
    Oscar Hiljemark, CM, 71
    Andrea Bertolacci, CM, 72
    Lukas Lerager, CM, 71
    Darko Lazović, WM, 74
    Krzysztof Piątek, ST, 77
    Christian Kouamé, ST, 72
    Goran Pandev, ST, 72
    Antonio Sanabria, ST, 74
  `),
  pool('Torino', 'TOR', '2018/19', TORINO, '3-5-2', `
    Salvatore Sirigu, GK, 80
    Salvador Ichazo, GK, 68
    Nicolas N’Koulou, CB, 79
    Armando Izzo, CB, 78
    Emiliano Moretti, CB, 73
    Kevin Bonifazi, CB, 72
    Lyanco, CB, 72
    Lorenzo De Silvestri, FB, 75
    Cristian Ansaldi, FB, 76
    Ola Aina, FB, 73
    Tomás Rincón, DM, 76
    Soualiho Meïté, CM, 76
    Daniele Baselli, CM, 76
    Saša Lukić, CM, 73
    Iago Falqué, W, 78
    Álex Berenguer, W, 74
    Vittorio Parigini, W, 70
    Andrea Belotti, ST, 81
    Simone Zaza, ST, 76
  `),
  pool('Sassuolo', 'SAS', '2021/22', SASSUOLO, '4-2-3-1', `
    Andrea Consigli, GK, 77
    Gianluca Pegolo, GK, 68
    Gian Marco Ferrari, CB, 76
    Vlad Chiricheș, CB, 74
    Martin Erlić, CB, 72
    Rogério, FB, 74
    Jeremy Toljan, FB, 75
    Mert Müldür, FB, 72
    Giorgos Kyriakopoulos, FB, 71
    Maxime Lopez, CM, 77
    Davide Frattesi, CM, 76
    Matheus Henrique, CM, 75
    Abdou Harroui, CM, 70
    Hamed Traorè, CM, 75
    Filip Đuričić, CM, 74
    Domenico Berardi, W, 82
    Junior Traoré, W, 72
    Gianluca Scamacca, ST, 78
    Giacomo Raspadori, ST, 78
    Grégoire Defrel, ST, 74
  `),
  pool('Fiorentina', 'FIO', '2022/23', VIOLA, '4-2-3-1', `
    Pietro Terracciano, GK, 78
    Salvatore Sirigu, GK, 72
    Nikola Milenković, CB, 80
    Lucas Martínez Quarta, CB, 78
    Igor, CB, 76
    Luca Ranieri, CB, 72
    Cristiano Biraghi, FB, 77
    Dodô, FB, 78
    Lorenzo Venuti, FB, 70
    Sofyan Amrabat, DM, 80
    Rolando Mandragora, CM, 76
    Giacomo Bonaventura, CM, 79
    Antonín Barák, CM, 77
    Alfred Duncan, CM, 74
    Gaetano Castrovilli, CM, 75
    Nicolás González, W, 80
    Riccardo Sottil, W, 74
    Jonathan Ikoné, W, 76
    Josip Brekalo, W, 74
    Arthur Cabral, ST, 76
    Luka Jović, ST, 76
    Christian Kouamé, ST, 72
  `),
]

const LIGUE_1: Pool[] = [
  pool('Nice', 'NIC', '2012/13', NICE, '4-3-3', `
    David Ospina, GK, 79
    Joris Delle, GK, 70
    Renato Civelli, CB, 74
    Nemanja Pejčinović, CB, 72
    Kevin Gomis, CB, 68
    Fabián Monzón, FB, 72
    Romain Genevois, FB, 70
    Timothée Kolodziejczak, FB, 70
    Didier Digard, CM, 74
    Kevin Anin, DM, 72
    Valentin Eysseric, CM, 73
    Grégoire Puel, FB, 66
    Eric Bauthéac, W, 73
    Jérémy Pied, W, 70
    Abraham Gneki Guié, W, 66
    Darío Cvitanich, ST, 75
    Alexy Bosetti, ST, 66
    Neal Maupay, ST, 62
    Lloyd Palun, CM, 68
  `),
  pool('Bordeaux', 'BOR', '2017/18', BORDEAUX, '4-3-3', `
    Benoît Costil, GK, 79
    Jérôme Prior, GK, 68
    Pablo, CB, 76
    Igor Lewczuk, CB, 74
    Vukašin Jovanović, CB, 74
    Jules Koundé, CB, 65
    Youssouf Sabaly, FB, 75
    Maxime Poundjé, FB, 72
    Théo Pellenard, FB, 68
    Jérémy Toulalan, DM, 76
    Otávio, CM, 75
    Jaroslav Plašil, CM, 74
    Younousse Sankharé, CM, 74
    Lukas Lerager, CM, 72
    Valentin Vada, CM, 72
    Malcom, W, 79
    François Kamano, W, 77
    Jonathan Cafú, W, 72
    Nicolas de Préville, ST, 76
    Gaëtan Laborde, ST, 74
    Andreas Cornelius, ST, 72
  `),
  pool('Rennes', 'REN', '2017/18', RENNES, '4-3-3', `
    Tomáš Koubek, GK, 75
    Abdoulaye Diallo, GK, 70
    Joris Gnagnon, CB, 74
    Mexer, CB, 74
    Ramy Bensebaini, FB/CB, 73
    Hamari Traoré, FB, 75
    Ludovic Baal, FB, 70
    Benjamin André, DM, 78
    James Léa Siliki, CM, 72
    Clément Grenier, CM, 74
    Sanjin Prcić, CM, 72
    Yoann Gourcuff, CM, 74
    Wahbi Khazri, W/CM, 78
    Ismaïla Sarr, W, 75
    Mehdi Zeffane, FB, 72
    Romain Danzé, FB, 70
    Diafra Sakho, ST, 75
    Adrien Hunou, ST, 72
    Benjamin Bourigeaud, CM, 74
    Jordan Siebatcheu, ST, 68
  `),
  pool('Lille', 'LIL', '2022/23', LILLE, '4-2-3-1', `
    Lucas Chevalier, GK, 74
    Adam Jakubech, GK, 68
    José Fonte, CB, 78
    Bafodé Diakité, CB, 74
    Alexsandro Ribeiro, CB, 74, Alexsandro
    Tiago Djaló, CB, 75
    Leny Yoro, CB, 65
    Ismaily, FB, 75
    Tiago Santos, FB, 72
    Gabriel Gudmundsson, FB, 72
    Benjamin André, DM, 79
    André Gomes, CM, 77
    Angel Gomes, CM, 76
    Carlos Baleba, CM, 66
    Rémy Cabella, CM/W, 77
    Edon Zhegrova, W, 77
    Adam Ounas, W, 75
    Jonathan Bamba, W, 78
    Timothy Weah, W, 74
    Jonathan David, ST, 81
    Mohamed Bayo, ST, 72
  `),
]

/** Every extra club-season, after all the rest. */
export const POOLS: Pool[] = [
  ...of('Premier League', PREMIER_LEAGUE),
  ...of('La Liga', LA_LIGA),
  ...of('Bundesliga', BUNDESLIGA),
  ...of('Serie A', SERIE_A),
  ...of('Ligue 1', LIGUE_1),
]

/** Left-footed players in these squads (not already in the other files). */
export const LEFT_FOOTED: string[] = [
  'Matthew Etherington', 'Marc Wilson', 'Danny Higginbotham', 'Andy Wilkinson', 'John Arne Riise',
  'Damien Duff', 'Adam Drury', 'Marc Tierney', 'Anthony Pilkington', 'Wes Hoolahan', 'Chris Brunt',
  'Goran Popov', 'Liam Ridgewell', 'Andrea Dossena', 'Emanuele Giaccherini', 'Adam Johnson',
  'Danny Fox', 'Maynor Figueroa', 'George Boyd', 'Tom Huddlestone', 'Charlie Daniels', 'Marc Pugh',
  'Junior Stanislas', 'José Holebas', 'Ken Sema', 'Rico Henry', 'Antonee Robinson', 'Tim Ream',
  'Harry Wilson', 'Milos Kerkez', 'Marcos Senesi', 'Luis Sinisterra',
  'David Brooks', 'Mateo Musacchio', 'Samu Castillejo', 'Diego Perotti', 'Vitolo',
  'Pablo Piatti', 'Theo Hernández', 'Ibai Gómez', 'Víctor Camarasa', 'Alfonso Espino', 'Javi Galán',
  'Franco Cervi', 'Carles Pérez', 'Mason Greenwood', 'Gastón Álvarez', 'Juan Arango', 'Oscar Wendt',
  'Filip Daems', 'Santiago García', 'Ulisses Garcia', 'Gaëtan Bussmann', 'Niko Gießelmann',
  'Diego Contento', 'Anderson Lucoqui', 'Ritsu Dōan', 'Danilo Soares', 'Gerrit Holtmann',
  'Gabriel Silva', 'Giovanni Pasquale', 'Giovanni Marchese', 'Alejandro Gómez', 'Pablo Barrientos',
  'Lucas Castro', 'Domenico Criscito', 'Cristian Ansaldi', 'Iago Falqué', 'Rogério',
  'Giorgos Kyriakopoulos', 'Domenico Berardi', 'Cristiano Biraghi', 'Fabián Monzón',
  'Maxime Poundjé', 'Malcom', 'François Kamano', 'Ramy Bensebaini', 'Ismaily', 'Gabriel Gudmundsson',
  'Edon Zhegrova', 'Adam Ounas', 'Nicolás González', 'Riccardo Sottil',
  'Jaume Costa',
]

/** Weak foot where it isn't 3 stars (not already in the other files). */
export const WEAK_FOOT: Record<string, number> = {
  'Wes Hoolahan': 4, 'Gerard Deulofeu': 4, 'Roberto Pereyra': 4, 'Malcom': 2,
  'Domenico Berardi': 2, 'Juan Arango': 2, 'Iago Falqué': 2, 'Edon Zhegrova': 2,
}

/** Archetypes of the best-known players here (not already in the other files). */
export const ARCHETYPE: Record<string, Archetype> = {
  'Asmir Begović': 'shotStopper', 'Mark Schwarzer': 'shotStopper', 'Bernd Leno': 'shotStopper',
  'David Raya': 'sweeperKeeper', 'David Ospina': 'shotStopper', 'Benoît Costil': 'shotStopper',
  'Ryan Shawcross': 'stopper', 'Robert Huth': 'stopper', 'Brede Hangeland': 'stopper',
  'Jonas Olsson': 'stopper', 'Dejan Lovren': 'stopper', 'José Fonte': 'stopper',
  'Nicolás Otamendi': 'stopper', 'Mateo Musacchio': 'ballPlayer', 'Dante': 'ballPlayer',
  'Nikola Milenković': 'stopper', 'Dakonam Djené': 'stopper', 'Nicolas N’Koulou': 'stopper',
  'José Holebas': 'overlapping', 'Antonee Robinson': 'overlapping', 'Milos Kerkez': 'overlapping',
  'Theo Hernández': 'overlapping', 'Javi Galán': 'overlapping', 'Rico Henry': 'overlapping',
  'Domenico Criscito': 'overlapping', 'Dodô': 'overlapping', 'Cristiano Biraghi': 'overlapping',
  'Morgan Schneiderlin': 'ballWinner', 'Étienne Capoue': 'ballWinner', 'João Palhinha': 'ballWinner',
  'Lee Cattermole': 'ballWinner', 'Sofyan Amrabat': 'ballWinner', 'Christian Nørgaard': 'anchor',
  'Bruno Soriano': 'anchor', 'Benjamin André': 'ballWinner', 'Mauro Arambarri': 'ballWinner',
  'Tomás Rincón': 'ballWinner', 'Renato Tapia': 'anchor', 'Javi Fuego': 'anchor',
  'Danny Murphy': 'playmaker', 'Tom Huddlestone': 'playmaker', 'Francesco Lodi': 'playmaker',
  'Miguel Veloso': 'playmaker', 'Maxime Lopez': 'playmaker',
  'Wes Hoolahan': 'playmaker', 'Christian Eriksen': 'playmaker', 'Zlatko Junuzović': 'playmaker',
  'Giacomo Bonaventura': 'playmaker', 'Yunus Mallı': 'playmaker', 'Rémy Cabella': 'playmaker',
  'Abdoulaye Doucouré': 'boxToBox', 'Clint Dempsey': 'boxToBox', 'Davide Frattesi': 'boxToBox',
  'Youssouf Mulumbu': 'boxToBox', 'Vicente Iborra': 'boxToBox', 'Harry Arter': 'boxToBox',
  'Adam Lallana': 'playmaker', 'Gabri Veiga': 'boxToBox',
  'Matthew Etherington': 'winger', 'Jermaine Pennant': 'winger', 'Adam Johnson': 'insideForward',
  'Gerard Deulofeu': 'insideForward', 'Sofiane Feghouli': 'winger',
  'Domenico Berardi': 'insideForward', 'Malcom': 'insideForward', 'Jonathan Bamba': 'insideForward',
  'Edon Zhegrova': 'insideForward', 'Antoine Semenyo': 'insideForward', 'Patrick Herrmann': 'winger',
  'Alejandro Gómez': 'insideForward', 'Iago Falqué': 'insideForward', 'Dodi Lukébakio': 'insideForward',
  'Bryan Mbeumo': 'insideForward', 'Nicolás González': 'insideForward', 'Jordon Ibe': 'winger',
  'Kenwyne Jones': 'targetMan', 'Grant Holt': 'targetMan', 'Rickie Lambert': 'targetMan',
  'Troy Deeney': 'targetMan', 'Ivan Toney': 'targetMan', 
  'Steven Fletcher': 'targetMan', 'Philipp Hofmann': 'targetMan', 'Fabian Klos': 'targetMan',
  'Andrea Belotti': 'poacher', 'Krzysztof Piątek': 'poacher', 'Carlos Bacca': 'poacher',
  'Peter Odemwingie': 'poacher', 'Antonio Di Natale': 'poacher', 'Jonathan David': 'poacher',
  'Callum Wilson': 'poacher', 'Joshua King': 'poacher', 'Gonzalo Bergessio': 'poacher',
  'Evanilson': 'poacher', 'Borja Mayoral': 'poacher', 'Gianluca Scamacca': 'targetMan',
  'Giacomo Raspadori': 'falseNine', 'Diafra Sakho': 'poacher', 'Darío Cvitanich': 'poacher',
}
