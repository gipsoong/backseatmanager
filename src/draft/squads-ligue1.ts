/** Draft mode's Ligue 1 clubs: squads of single seasons, 2010/11 to 2024/25 (see squads.ts). */
import type { Archetype } from '../engine/index.ts'
import { kit, pool, type Pool } from './squads.ts'

const NAVY = kit('#1b2a4a', '#ffffff', 'blue')
const MONACO = kit('#d4111c', '#ffffff', 'red')
const LYON = kit('#f4f4f0', '#1d3c8f', 'white')
const OM = kit('#f4f4f0', '#2fa4dc', 'white')
const LILLE = kit('#d0102b', '#ffffff', 'red')
const MHSC = kit('#1b2c5c', '#f08a24', 'blue')
const ASSE = kit('#0b7a3e', '#ffffff', 'green')
const BORDEAUX = kit('#1a2340', '#ffffff', 'blue')
const NICE = kit('#c8102e', '#111111', 'red')
const RENNES = kit('#d81e2a', '#111111', 'red')
const LENS = kit('#f6d20e', '#c8102e', 'yellow')
const NANTES = kit('#f7d40a', '#0e7a3a', 'yellow')
const TFC = kit('#5b2a86', '#ffffff', 'purple')
const RCSA = kit('#1d6fc2', '#ffffff', 'blue')
const REIMS = kit('#d0112b', '#ffffff', 'red')
const BREST = kit('#e3001b', '#ffffff', 'red')
const FCL = kit('#f37021', '#111111', 'orange')
const EAG = kit('#c8102e', '#111111', 'red')
const SCO = kit('#1d1d1b', '#ffffff', 'black')
const CAEN = kit('#1b3f8f', '#e30613', 'blue')
const BASTIA = kit('#1c4fa0', '#ffffff', 'blue')
const AJA = kit('#f4f4f0', '#1d4fa0', 'white')

export const POOLS: Pool[] = [
  pool('Paris Saint-Germain', 'PSG', '2012/13', NAVY, '4-4-2', `
    Salvatore Sirigu, GK, 80
    Nicolas Douchez, GK, 73
    Thiago Silva, CB, 87, Thiago Silva
    Alex, CB, 81
    Mamadou Sakho, CB, 77
    Zoumana Camara, CB/FB, 73
    Christophe Jallet, FB/WM, 76
    Maxwell, FB, 80
    Gregory van der Wiel, FB, 79
    Siaka Tiéné, FB, 74
    Thiago Motta, DM/CM, 82
    Blaise Matuidi, CM/DM, 80
    Marco Verratti, CM/DM, 74
    Clément Chantôme, CM/DM, 74
    David Beckham, CM/WM, 78
    Javier Pastore, CM/W, 82
    Lucas Moura, W, 78, Lucas Moura
    Ezequiel Lavezzi, W/ST, 83
    Jérémy Ménez, W/ST, 79
    Nenê, W/CM, 80
    Zlatan Ibrahimović, ST, 90
    Kevin Gameiro, ST, 79
    Guillaume Hoarau, ST, 74
  `),
  pool('Paris Saint-Germain', 'PSG', '2015/16', NAVY, '4-3-3', `
    Kevin Trapp, GK, 81
    Salvatore Sirigu, GK, 81
    Thiago Silva, CB, 88, Thiago Silva
    David Luiz, CB/DM, 83
    Marquinhos, CB/FB, 81
    Presnel Kimpembe, CB, 66
    Serge Aurier, FB, 79
    Gregory van der Wiel, FB, 79
    Maxwell, FB, 80
    Layvin Kurzawa, FB, 78
    Thiago Motta, DM, 84
    Blaise Matuidi, CM/DM, 83
    Marco Verratti, CM/DM, 84
    Adrien Rabiot, CM/DM, 77
    Benjamin Stambouli, DM/CM, 74
    Javier Pastore, CM/W, 83
    Ángel Di María, W/CM, 87
    Lucas Moura, W, 82, Lucas Moura
    Ezequiel Lavezzi, W/ST, 82
    Jean-Kévin Augustin, ST, 65
    Edinson Cavani, ST/W, 85
    Zlatan Ibrahimović, ST, 90
  `),
  pool('Paris Saint-Germain', 'PSG', '2017/18', NAVY, '4-3-3', `
    Alphonse Areola, GK, 80
    Kevin Trapp, GK, 82
    Thiago Silva, CB, 88, Thiago Silva
    Marquinhos, CB/DM, 84
    Presnel Kimpembe, CB, 77
    Dani Alves, FB/CM, 84
    Thomas Meunier, FB, 80
    Layvin Kurzawa, FB, 79
    Yuri Berchiche, FB, 78
    Thiago Motta, DM, 83
    Marco Verratti, CM/DM, 87
    Adrien Rabiot, CM/DM, 82
    Giovani Lo Celso, CM/DM, 76
    Lassana Diarra, DM, 79
    Julian Draxler, W/CM, 85
    Javier Pastore, CM/W, 82
    Christopher Nkunku, CM/W, 72
    Ángel Di María, W/CM, 86
    Neymar, W/ST, 92
    Kylian Mbappé, ST/W, 87
    Edinson Cavani, ST, 87
  `),
  pool('Paris Saint-Germain', 'PSG', '2022/23', NAVY, '3-5-2', `
    Gianluigi Donnarumma, GK, 88
    Keylor Navas, GK, 87
    Sergio Rico, GK, 75
    Marquinhos, CB, 87
    Sergio Ramos, CB, 84
    Presnel Kimpembe, CB, 84
    Danilo Pereira, DM/CB, 80
    Achraf Hakimi, FB/WM, 84
    Nuno Mendes, FB/WM, 80
    Juan Bernat, FB, 80
    Nordi Mukiele, FB/CB, 79
    Marco Verratti, CM/DM, 87
    Vitinha, CM, 80
    Fabián Ruiz, CM, 83
    Carlos Soler, CM/WM, 82
    Renato Sanches, CM, 80
    Warren Zaïre-Emery, CM, 65
    Lionel Messi, W/CM/ST, 91
    Neymar, W/CM/ST, 89
    Kylian Mbappé, ST/W, 91
    Hugo Ekitike, ST, 74
    Pablo Sarabia, W/CM, 79
  `),
  pool('Paris Saint-Germain', 'PSG', '2024/25', NAVY, '4-3-3', `
    Gianluigi Donnarumma, GK, 89
    Matvey Safonov, GK, 76
    Arnau Tenas, GK, 69
    Marquinhos, CB, 86
    Willian Pacho, CB, 80
    Lucas Beraldo, CB/FB, 77
    Lucas Hernández, CB/FB, 84
    Achraf Hakimi, FB, 86
    Nuno Mendes, FB, 82
    Vitinha, CM/DM, 85
    João Neves, CM/DM, 82
    Fabián Ruiz, CM, 83
    Warren Zaïre-Emery, CM/FB, 80
    Lee Kang-in, CM/W, 78, Lee
    Senny Mayulu, CM, 64
    Ousmane Dembélé, W/ST, 86
    Khvicha Kvaratskhelia, W, 86
    Bradley Barcola, W, 80
    Désiré Doué, W/CM, 77
    Gonçalo Ramos, ST, 81
    Randal Kolo Muani, ST, 81
  `),
  pool('Monaco', 'ASM', '2013/14', MONACO, '4-3-3', `
    Danijel Subašić, GK, 77
    Sergio Romero, GK, 77
    Ricardo Carvalho, CB, 80
    Eric Abidal, CB/FB, 79
    Andrea Raggi, CB/FB, 74
    Nicolas Isimat-Mirin, CB, 70
    Layvin Kurzawa, FB, 73
    Fabinho, FB/DM, 74
    Nabil Dirar, WM/FB, 75
    Jérémy Toulalan, DM/CB, 81
    João Moutinho, CM, 84
    Geoffrey Kondogbia, CM/DM, 75
    James Rodríguez, CM/W, 82
    Lucas Ocampos, W, 72
    Yannick Carrasco, W, 71
    Anthony Martial, ST/W, 69
    Valère Germain, ST, 72
    Emmanuel Rivière, ST, 74
    Radamel Falcao, ST, 88
    Dimitar Berbatov, ST, 81
  `),
  pool('Monaco', 'ASM', '2016/17', MONACO, '4-4-2', `
    Danijel Subašić, GK, 83
    Morgan De Sanctis, GK, 76
    Kamil Glik, CB, 82
    Jemerson, CB, 77
    Andrea Raggi, CB/FB, 76
    Djibril Sidibé, FB/WM, 80
    Benjamin Mendy, FB, 78
    Almamy Touré, FB/CB, 68
    Jorge, FB, 74
    Fabinho, DM/FB, 82
    Tiémoué Bakayoko, DM/CM, 78
    João Moutinho, CM, 84
    Gabriel Boschilia, CM, 72
    Thomas Lemar, WM/CM, 80
    Bernardo Silva, WM/CM, 81, Bernardo
    Nabil Dirar, WM/FB, 77
    Rachid Ghezzal, WM, 74
    Kylian Mbappé, ST/W, 80
    Radamel Falcao, ST, 83
    Valère Germain, ST, 77
    Guido Carrillo, ST, 72
  `),
  pool('Monaco', 'ASM', '2021/22', MONACO, '4-4-2', `
    Alexander Nübel, GK, 79
    Radosław Majecki, GK, 70
    Axel Disasi, CB, 78
    Benoît Badiashile, CB, 77
    Guillermo Maripán, CB, 78
    Ruben Aguilar, FB, 77
    Caio Henrique, FB/WM, 77
    Vanderson, FB, 72
    Djibril Sidibé, FB, 76
    Ismail Jakobs, FB/WM, 72
    Aurélien Tchouaméni, DM/CM, 81
    Youssouf Fofana, CM/DM, 79
    Jean Lucas, CM, 75
    Eliot Matazo, DM, 70
    Aleksandr Golovin, WM/CM, 80
    Sofiane Diop, WM/CM, 76
    Gelson Martins, WM/W, 79
    Krépin Diatta, WM/W, 76
    Kevin Volland, ST, 81
    Wissam Ben Yedder, ST, 84
    Myron Boadu, ST, 74
  `),
  pool('Lyon', 'OL', '2010/11', LYON, '4-3-3', `
    Hugo Lloris, GK, 83
    Rémy Vercoutre, GK, 72
    Cris, CB, 80
    Dejan Lovren, CB, 75
    Mouhamadou Dabo, FB/CB, 72
    Anthony Réveillère, FB, 77
    Aly Cissokho, FB, 78
    Michel Bastos, W/FB, 81
    Kim Källström, CM, 80
    Jean II Makoun, DM/CM, 77
    Maxime Gonalons, DM, 72
    Miralem Pjanić, CM, 79
    Yoann Gourcuff, CM, 84
    Clément Grenier, CM, 66
    César Delgado, W, 78
    Jimmy Briand, W/ST, 77
    Lisandro López, ST, 84, Lisandro
    Bafétimbi Gomis, ST, 79
    Alexandre Lacazette, ST/W, 64
  `),
  pool('Lyon', 'OL', '2015/16', LYON, '4-3-3', `
    Anthony Lopes, GK, 80
    Mathieu Gorgelin, GK, 67
    Samuel Umtiti, CB, 78
    Mapou Yanga-Mbiwa, CB, 77
    Milan Biševac, CB, 76
    Christophe Jallet, FB, 77
    Rafael, FB, 76
    Jérémy Morel, FB/CB, 75
    Henri Bedimo, FB, 74
    Mehdi Zeffane, FB, 68
    Maxime Gonalons, DM, 81
    Corentin Tolisso, CM/DM, 77
    Jordan Ferri, CM, 75
    Sergi Darder, CM, 76
    Lucas Tousart, DM, 66
    Mathieu Valbuena, CM/W, 81
    Nabil Fekir, CM/W/ST, 79
    Rachid Ghezzal, W, 74
    Maxwel Cornet, W/ST, 66
    Claudio Beauvue, ST, 77
    Alexandre Lacazette, ST, 82
  `),
  pool('Lyon', 'OL', '2019/20', LYON, '3-5-2', `
    Anthony Lopes, GK, 85
    Ciprian Tătărușanu, GK, 77
    Jason Denayer, CB, 80
    Marcelo Guedes, CB, 79, Marcelo
    Joachim Andersen, CB, 78
    Fernando Marçal, FB/CB, 76, Marçal
    Léo Dubois, FB, 79
    Rafael, FB, 77
    Kenny Tete, FB, 74
    Maxwel Cornet, FB/W, 77
    Lucas Tousart, DM/CM, 78
    Thiago Mendes, DM/CM, 79
    Bruno Guimarães, DM/CM, 76
    Houssem Aouar, CM, 82
    Jean Lucas, CM, 71
    Jeff Reine-Adélaïde, CM, 75
    Martin Terrier, ST/W, 75
    Bertrand Traoré, W/ST, 78
    Rayan Cherki, CM/W, 68
    Memphis Depay, ST/W, 85
    Moussa Dembélé, ST, 81
    Karl Toko Ekambi, ST/W, 78
  `),
  pool('Marseille', 'OM', '2010/11', OM, '4-2-3-1', `
    Steve Mandanda, GK, 83
    Elinton Andrade, GK, 70
    Souleymane Diawara, CB, 79
    Gabriel Heinze, CB/FB, 79
    Stéphane M’Bia, DM/CB, 79
    Rod Fanni, FB/CB, 76
    César Azpilicueta, FB, 72
    Laurent Bonnart, FB, 74
    Taye Taiwo, FB, 77
    Édouard Cissé, DM, 75
    Benoît Cheyrou, CM/DM, 77
    Charles Kaboré, DM/CM, 74
    Lucho González, CM, 83, Lucho
    Mathieu Valbuena, CM/W, 79
    André Ayew, W/CM, 75
    Jordan Ayew, W/ST, 65
    Loïc Rémy, ST/W, 79
    André-Pierre Gignac, ST, 78
    Brandão, ST, 76
  `),
  pool('Marseille', 'OM', '2014/15', OM, '4-2-3-1', `
    Steve Mandanda, GK, 84
    Yohann Pelé, GK, 70
    Nicolas N’Koulou, CB, 80
    Jérémy Morel, CB/FB, 76
    Rod Fanni, CB/FB, 76
    Stéphane Sparagna, CB, 64
    Brice Dja Djédjé, FB, 73
    Benjamin Mendy, FB, 72
    Giannelli Imbula, DM/CM, 77
    Alaixys Romao, DM, 74
    Mario Lemina, DM/CM, 72
    Abdelaziz Barrada, CM, 74
    Dimitri Payet, CM/W, 82
    Florian Thauvin, W, 77
    André Ayew, W/ST, 79
    Romain Alessandrini, W, 75
    Lucas Ocampos, W, 73
    André-Pierre Gignac, ST, 80
    Michy Batshuayi, ST, 72
  `),
  pool('Marseille', 'OM', '2017/18', OM, '4-2-3-1', `
    Steve Mandanda, GK, 83
    Yohann Pelé, GK, 72
    Adil Rami, CB, 81
    Rolando, CB, 78
    Aymen Abdennour, CB, 76
    Boubacar Kamara, CB/DM, 66
    Hiroki Sakai, FB, 77
    Bouna Sarr, FB/WM, 73
    Jordan Amavi, FB, 77
    Patrice Evra, FB, 77
    Luiz Gustavo, DM/CB, 82
    André-Frank Zambo Anguissa, DM/CM, 75
    Morgan Sanson, CM, 79
    Maxime Lopez, CM, 74
    Grégory Sertic, DM, 72
    Dimitri Payet, CM/W, 84
    Florian Thauvin, W, 82
    Lucas Ocampos, W, 77
    Clinton N’Jie, W/ST, 74
    Kostas Mitroglou, ST, 78
    Valère Germain, ST, 77
  `),
  pool('Lille', 'LOSC', '2010/11', LILLE, '4-3-3', `
    Mickaël Landreau, GK, 80
    Ludovic Butelle, GK, 70
    Adil Rami, CB, 78
    Aurélien Chedjou, CB, 75
    David Rozehnal, CB, 75
    Mathieu Debuchy, FB/WM, 77
    Franck Béria, FB, 73
    Jerry Vandam, FB/CB, 66
    Rio Mavuba, DM, 79
    Yohan Cabaye, CM, 79
    Florent Balmont, CM/DM, 76
    Stéphane Dumont, CM, 70
    Idrissa Gueye, DM, 64
    Ludovic Obraniak, W/CM, 76
    Eden Hazard, W/CM, 80
    Gervinho, W/ST, 79
    Pierre-Alain Frau, W/ST, 72
    Moussa Sow, ST, 77
    Túlio de Melo, ST, 72
  `),
  pool('Lille', 'LOSC', '2018/19', LILLE, '4-2-3-1', `
    Mike Maignan, GK, 77
    Orestis Karnezis, GK, 76
    José Fonte, CB, 79
    Gabriel Magalhães, CB, 72, Gabriel
    Adama Soumaoro, CB, 72
    Edgar Ié, CB/FB, 70
    Zeki Çelik, FB, 75
    Youssouf Koné, FB, 72
    Fodé Ballo-Touré, FB, 71
    Thiago Mendes, DM/CM, 78
    Boubakary Soumaré, DM/CM, 73
    Xeka, DM/CM, 74
    Jonathan Ikoné, CM/W, 78
    Jérémy Pied, W/FB, 72
    Nicolas Pépé, W, 80
    Jonathan Bamba, W, 78
    Luiz Araújo, W, 75
    Rafael Leão, ST/W, 73
    Loïc Rémy, ST, 76
  `),
  pool('Lille', 'LOSC', '2020/21', LILLE, '4-4-2', `
    Mike Maignan, GK, 84
    Léo Jardim, GK, 70
    José Fonte, CB, 80
    Sven Botman, CB, 76
    Tiago Djaló, CB, 70
    Zeki Çelik, FB, 77
    Reinildo Mandava, FB, 74, Reinildo
    Domagoj Bradarić, FB, 73
    Benjamin André, DM/CM, 80
    Boubakary Soumaré, CM/DM, 78
    Renato Sanches, CM, 81
    Xeka, DM, 76
    Jonathan Ikoné, WM/W, 80
    Jonathan Bamba, WM/W, 79
    Luiz Araújo, WM/W, 77
    Yusuf Yazıcı, CM/W, 78
    Timothy Weah, W/ST, 72
    Burak Yılmaz, ST, 82
    Jonathan David, ST, 79
  `),
  pool('Montpellier', 'MHSC', '2011/12', MHSC, '4-2-3-1', `
    Geoffrey Jourdren, GK, 77
    Laurent Pionnier, GK, 66
    Mapou Yanga-Mbiwa, CB, 75
    Vitorino Hilton, CB, 77, Hilton
    Abdelhamid El Kaoutari, CB/FB, 70
    Henri Bedimo, FB, 74
    Garry Bocaly, FB, 72
    Cyril Jeunechamp, FB/CB, 70
    Jamel Saihi, DM, 72
    Joris Marveaux, CM, 72
    Benjamin Stambouli, DM/CM, 70
    Younès Belhanda, CM, 76
    Marco Estrada, CM/DM, 74
    Rémy Cabella, CM/W, 68
    Karim Aït-Fana, W, 71
    John Utaka, W/ST, 76
    Souleymane Camara, W/ST, 72
    Emanuel Herrera, ST, 68
    Olivier Giroud, ST, 77
  `),
  pool('Saint-Étienne', 'ASSE', '2012/13', ASSE, '4-3-3', `
    Stéphane Ruffier, GK, 79
    Jérémie Janot, GK, 72
    Loïc Perrin, CB, 77
    Moustapha Bayal Sall, CB, 75
    Kurt Zouma, CB, 66
    François Clerc, FB, 73
    Faouzi Ghoulam, FB, 72
    Jérémy Clément, DM/CM, 74
    Josuha Guilavogui, DM, 73
    Fabien Lemoine, CM, 74
    Renaud Cohade, CM, 72
    Benjamin Corgnet, CM/W, 73
    Yohan Mollo, W, 74
    Romain Hamouma, W, 74
    Max-Alain Gradel, W/ST, 75
    Pierre-Emerick Aubameyang, ST/W, 79
    Brandão, ST, 77
    Paul Baysse, CB, 71
    Jonathan Brison, FB/WM, 70
  `),
  pool('Saint-Étienne', 'ASSE', '2018/19', ASSE, '4-3-3', `
    Stéphane Ruffier, GK, 81
    Jessy Moulin, GK, 70
    Loïc Perrin, CB, 80
    Neven Subotić, CB, 78
    Timothée Kolodziejczak, CB/FB, 75
    Mathieu Debuchy, FB, 76
    Gabriel Silva, FB, 72
    Ronaël Pierre-Gabriel, FB, 70
    Yann M’Vila, DM, 80
    Ole Selnæs, CM/DM, 75
    Assane Diousse, DM, 72
    Mahdi Camara, CM, 68
    Rémy Cabella, CM/W, 79
    Kévin Monnet-Paquet, W/FB, 74
    Romain Hamouma, W, 76
    Arnaud Nordin, W, 69
    Wahbi Khazri, W/ST, 79
    Robert Berić, ST, 76
    Charles Abi, ST, 66
  `),
  pool('Bordeaux', 'FCGB', '2012/13', BORDEAUX, '3-5-2', `
    Cédric Carrasso, GK, 79
    Kévin Olimpa, GK, 68
    Marc Planus, CB, 75
    Ludovic Sané, CB, 74
    Matthieu Chalmé, CB/FB, 73
    Mariano Ferreira Filho, FB/WM, 76, Mariano
    Benoît Trémoulinas, FB/WM, 77
    Florian Marange, FB, 70
    Jaroslav Plašil, CM, 76
    Landry N’Guémo, DM, 74
    Grégory Sertic, DM/CM, 72
    Ludovic Obraniak, CM/W, 77
    Henri Saivet, CM, 69
    Julien Faubert, WM/FB, 74
    Fahid Ben Khalfallah, WM, 73
    Nicolas Maurice-Belay, WM, 74
    Jussiê, ST/CM, 75
    Yoan Gouffran, ST/W, 75
    Cheick Diabaté, ST, 76
  `),
  pool('Nice', 'OGCN', '2016/17', NICE, '3-5-2', `
    Yoan Cardinale, GK, 75
    Walter Benítez, GK, 70
    Dante, CB, 80
    Paul Baysse, CB, 72
    Malang Sarr, CB/FB, 66
    Maxime Le Marchand, CB/FB, 73
    Ricardo Pereira, FB/WM, 76
    Arnaud Souquet, FB, 72
    Dalbert, FB/WM, 73
    Jean Michaël Seri, CM/DM, 81
    Wylan Cyprien, CM, 77
    Nampalys Mendy, DM, 72
    Vincent Koziello, CM, 72
    Rémi Walter, CM, 70
    Valentin Eysseric, CM/W, 74
    Younès Belhanda, CM, 79
    Alassane Pléa, ST/W, 76
    Mario Balotelli, ST, 81
    Anastasios Donis, W/ST, 69
    Mickaël Le Bihan, ST, 70
  `),
  pool('Nice', 'OGCN', '2021/22', NICE, '4-4-2', `
    Walter Benítez, GK, 79
    Marcin Bułka, GK, 70
    Jean-Clair Todibo, CB, 78
    Dante, CB, 78
    Flavius Daniliuc, CB/FB, 66
    Jordan Lotomba, FB, 74
    Melvin Bard, FB, 74
    Youcef Atal, FB/WM, 76
    Khéphren Thuram, CM/DM, 76
    Mario Lemina, DM/CM, 76
    Pablo Rosario, DM/CM, 75
    Morgan Schneiderlin, DM, 74
    Hicham Boudaoui, CM/WM, 74
    Calvin Stengs, WM/CM, 76
    Justin Kluivert, WM/W, 76
    Alexis Claude-Maurice, WM/CM, 70
    Amine Gouiri, ST/W, 79
    Andy Delort, ST, 79
    Kasper Dolberg, ST, 77
  `),
  pool('Rennes', 'SRFC', '2019/20', RENNES, '4-4-2', `
    Édouard Mendy, GK, 79
    Romain Salin, GK, 70
    Damien Da Silva, CB, 76
    Joris Gnagnon, CB, 74
    Nayef Aguerd, CB, 74
    Jérémy Gélin, CB/DM, 70
    Hamari Traoré, FB, 76
    Faitout Maouassa, FB, 73
    Mehdi Zeffane, FB, 70
    Steven N’Zonzi, DM, 81
    Eduardo Camavinga, CM/DM, 73
    Clément Grenier, CM, 75
    James Léa Siliki, CM, 72
    Flavien Tait, CM/WM, 75
    Benjamin Bourigeaud, WM/CM, 77
    Raphinha, WM/W, 76
    Romain Del Castillo, WM/W, 72
    M’Baye Niang, ST/W, 77
    Adrien Hunou, ST/CM, 76
    Serhou Guirassy, ST, 75
  `),
  pool('Rennes', 'SRFC', '2023/24', RENNES, '4-4-2', `
    Steve Mandanda, GK, 79
    Gauthier Gallon, GK, 70
    Arthur Theate, CB/FB, 79
    Warmed Omari, CB, 74
    Christopher Wooh, CB, 72
    Lorenz Assignon, FB, 74
    Adrien Truffert, FB, 77
    Guéla Doué, FB/CB, 70
    Baptiste Santamaria, DM/CM, 77
    Enzo Le Fée, CM, 77
    Azor Matusiwa, DM, 74
    Désiré Doué, CM/W, 74
    Benjamin Bourigeaud, WM/CM, 79
    Ludovic Blas, WM/CM, 78
    Ibrahim Salah, W, 70
    Fabian Rieder, CM, 74
    Martin Terrier, ST/W, 81
    Amine Gouiri, ST/W, 80
    Arnaud Kalimuendo, ST, 76
    Bertuğ Yıldırım, ST, 70
  `),
  pool('Lens', 'RCL', '2022/23', LENS, '3-4-3', `
    Brice Samba, GK, 81
    Jean-Louis Leca, GK, 72
    Kevin Danso, CB, 79
    Jonathan Gradit, CB, 75
    Facundo Medina, CB/FB, 77
    Julien Le Cardinal, CB, 69
    Przemysław Frankowski, FB/WM, 77
    Deiver Machado, FB/WM, 75
    Massadio Haïdara, FB, 73
    Seko Fofana, CM, 81
    Salis Abdul Samed, DM/CM, 77
    Łukasz Poręba, CM, 70
    Angelo Fulgini, CM/W, 76
    Adrien Thomasson, CM/W, 75
    David Pereira da Costa, W/CM, 73
    Florian Sotoca, W/ST, 76
    Wesley Saïd, ST/W, 72
    Loïs Openda, ST, 77
    Lys Mousset, ST, 66
  `),
  pool('Nantes', 'FCN', '2021/22', NANTES, '4-4-2', `
    Alban Lafont, GK, 80
    Rémy Descamps, GK, 70
    Andrei Girotto, CB/DM, 75
    Nicolas Pallois, CB, 77
    Jean-Charles Castelletto, CB, 75
    Dennis Appiah, FB, 72
    Sébastien Corchia, FB, 73
    Charles Traoré, FB, 72
    Quentin Merlin, FB/WM, 66
    Pedro Chirivella, DM/CM, 75
    Samuel Moutoussamy, CM, 73
    Lohann Doucet, CM, 64
    Roli Pereira de Sa, DM, 66
    Ludovic Blas, CM/WM, 78
    Moses Simon, WM/W, 79
    Marcus Coco, WM/FB, 72
    Osman Bukari, WM, 70
    Randal Kolo Muani, ST/W, 77
    Kalifa Coulibaly, ST, 72
    Jean-Kévin Augustin, ST, 70
  `),
  pool('Toulouse', 'TFC', '2022/23', TFC, '4-3-3', `
    Maxime Dupé, GK, 72
    Kjetil Haug, GK, 68
    Rasmus Nicolaisen, CB, 74
    Anthony Rouault, CB, 72
    Logan Costa, CB, 70
    Christian Mawissa, CB, 64
    Mikkel Desler, FB, 73
    Gabriel Suazo, FB, 73
    Moussa Diarra, FB/CB, 68
    Stijn Spierings, DM, 74
    Branco van den Boomen, CM, 76
    Brecht Dejaegere, CM, 74
    Vincent Sierro, CM/DM, 72
    Denis Genreau, CM, 70
    Fares Chaïbi, W/CM, 72
    Zakaria Aboukhlal, W, 73
    Veljko Birmančević, W, 72
    Ado Onaiwu, W/ST, 71
    Rhys Healey, ST, 72
    Thijs Dallinga, ST, 73
  `),
  pool('Strasbourg', 'RCSA', '2024/25', RCSA, '3-4-3', `
    Đorđe Petrović, GK, 78
    Karl-Johan Johnsson, GK, 70
    Andrew Omobamidele, CB, 72
    Abakar Sylla, CB, 73
    Ismaël Doukouré, CB, 73
    Mamadou Sarr, CB, 72
    Guéla Doué, FB/CB, 74
    Valentín Barco, FB/WM, 74
    Diego Moreira, WM/FB, 74
    Mathis Amougou, DM, 69
    Habib Diarra, CM, 76
    Andrey Santos, CM/DM, 77
    Félix Lemaréchal, CM, 70
    Pape Diong, DM, 66
    Sebastian Nanasi, W/CM, 74
    Dilane Bakwa, W, 76
    Abdoul Ouattara, W, 66
    Emanuel Emegha, ST, 75
    Moïse Sahi, ST, 64
  `),
  pool('Reims', 'SDR', '2022/23', REIMS, '4-2-3-1', `
    Yehvann Diouf, GK, 72
    Alexandre Olliero, GK, 66
    Yunis Abdelhamid, CB, 76
    Emmanuel Agbadou, CB, 70
    Joseph Okumu, CB, 72
    Andrew Gravillon, CB, 71
    Thomas Foket, FB, 74
    Thibault De Smet, FB, 70
    Bradley Locko, FB, 69
    Azor Matusiwa, DM, 74
    Marshall Munetsi, CM/DM, 74
    Jens Cajuste, CM, 73
    Valon Berisha, CM, 72
    Dion Lopy, DM, 66
    Junya Ito, W/WM, 76
    Alexis Flips, CM/W, 70
    Arbër Zeneli, W, 70
    Mitchell van Bergen, W, 69
    Mohamed Daramy, W, 70
    Folarin Balogun, ST, 73
    Kaj Sierhuis, ST, 67
  `),
  pool('Brest', 'SB29', '2023/24', BREST, '4-3-3', `
    Marco Bizot, GK, 77
    Grégoire Coudert, GK, 64
    Brendan Chardonnet, CB, 74
    Lilian Brassier, CB, 74
    Achraf Dari, CB, 70
    Julien Le Cardinal, CB/FB, 70
    Kenny Lala, FB, 73
    Bradley Locko, FB, 72
    Massadio Haïdara, FB, 70
    Pierre Lees-Melou, DM/CM, 76
    Mahdi Camara, CM/DM, 75
    Hugo Magnetti, CM, 72
    Jonas Martin, CM, 72
    Kamory Doumbia, CM/W, 70
    Romain Del Castillo, W, 76
    Jérémy Le Douaron, W/ST, 72
    Mathias Pereira Lage, W, 73
    Romain Faivre, W/CM, 73
    Steve Mounié, ST, 73
    Martín Satriano, ST, 72
    Ludovic Ajorque, ST, 74
  `),
  pool('Lorient', 'FCL', '2015/16', FCL, '4-2-3-1', `
    Benjamin Lecomte, GK, 74
    Paul Delecroix, GK, 66
    Lindsay Rose, CB, 72
    Zargo Touré, CB, 71
    Wesley Lautoa, CB/DM, 71
    Raphaël Guerreiro, FB/WM, 76
    Lamine Gassama, FB, 72
    Vincent Le Goff, FB, 68
    Didier Ndong, DM/CM, 72
    Rafidine Abdullah, CM/DM, 70
    Yann Jouffre, CM/W, 74
    Walid Mesloub, CM, 72
    Maxime Barthelmé, CM/W, 70
    Romain Philippoteaux, W/CM, 71
    Sylvain Marveaux, W/CM, 72
    Benjamin Moukandjo, W/ST, 74
    Majeed Waris, ST/W, 74
    Jérémie Aliadière, ST, 72
    Benjamin Jeannot, ST, 69
  `),
  pool('Guingamp', 'EAG', '2014/15', EAG, '4-2-3-1', `
    Mamadou Samassa, GK, 72
    Jonas Lössl, GK, 70
    Jérémy Sorbon, CB, 72
    Christophe Kerbrat, CB, 71
    Baïssama Sankoh, CB/DM, 70
    Lars Jacobsen, FB, 72
    Fernando Marçal, FB, 71, Marçal
    Dorian Lévêque, FB, 66
    Lionel Mathis, DM/CM, 72
    Moustapha Diallo, DM, 68
    Younousse Sankharé, CM, 70
    Thibault Giresse, CM, 69
    Sylvain Marveaux, CM/W, 72
    Christophe Mandanne, W/ST, 70
    Ladislas Douniama, W, 68
    Jérémy Pied, W/FB, 70
    Claudio Beauvue, ST, 75
    Mustapha Yatabaré, ST, 72
    Ronny Rodelin, ST/W, 68
  `),
  pool('Angers', 'SCO', '2016/17', SCO, '4-4-2', `
    Alexandre Letellier, GK, 70
    Ludovic Butelle, GK, 73
    Ismaël Traoré, CB, 74
    Romain Thomas, CB, 72
    Mateo Pavlović, CB, 70
    Vincent Manceau, FB, 70
    Abdoulaye Bamba, FB, 71
    Arnold Bouka Moutou, FB, 70
    Cheikh N’Doye, DM/CM, 74
    Thomas Mangani, CM/DM, 72
    Baptiste Santamaria, CM, 70
    Flavien Tait, CM/WM, 72
    Pierrick Capelle, WM/CM, 72
    Nicolas Pépé, WM/W/ST, 72
    Billy Ketkeophomphone, WM, 68
    Gilles Sunu, WM/ST, 68
    Karl Toko Ekambi, ST/W, 75
    Famara Diédhiou, ST, 73
    Jonathan Kodjia, ST, 70
  `),
  pool('Caen', 'SMC', '2014/15', CAEN, '4-3-3', `
    Rémy Vercoutre, GK, 73
    Paul Reulet, GK, 64
    Alaeddine Yahia, CB, 72
    Jean-Jacques Pierre, CB, 70
    Felipe Saad, CB, 70
    Dennis Appiah, FB, 70
    Emmanuel Imorou, FB, 70
    Jean Calvé, FB/CB, 66
    N’Golo Kanté, CM/DM, 72
    Nicolas Seube, DM, 70
    Jordan Adéoti, DM/CM, 68
    Julien Féret, CM, 74
    Lenny Nangis, W, 68
    Thomas Lemar, W/CM, 68
    Hervé Bazile, W, 69
    Jordan Nkololo, W/ST, 66
    Mathieu Duhamel, ST, 72
    Emiliano Sala, ST, 68
    Sloan Privat, ST, 69
  `),
  pool('Bastia', 'SCB', '2013/14', BASTIA, '4-3-3', `
    Mickaël Landreau, GK, 77
    Jean-Louis Leca, GK, 66
    Sébastien Squillaci, CB, 73
    Gaël Angoula, CB, 70
    Sambou Yatabaré, DM/CM, 70
    François Modesto, FB/CB, 71
    Gilles Cioni, FB, 70
    Julian Palmieri, FB, 70
    Yannick Cahuzac, DM, 72
    Romaric, CM, 71
    Ryad Boudebouz, CM/W, 74
    Wahbi Khazri, CM/W, 72
    Florian Raspentino, W/ST, 68
    Sadio Diallo, W, 68
    Ludovic Genest, WM/FB, 68
    Brandão, ST, 72
    Toifilou Maoulida, ST, 70
    Ilan, ST, 70
    Jérôme Rothen, WM/CM, 70
  `),
  pool('Auxerre', 'AJA', '2010/11', AJA, '4-4-2', `
    Olivier Sorin, GK, 74
    Rémy Riou, GK, 68
    Stéphane Grichting, CB, 74
    Adama Coulibaly, CB, 73
    Jean-Pascal Mignot, CB/FB, 72
    Cédric Hengbart, FB, 72
    Jérémy Berthod, FB, 68
    Benoît Pedretti, CM/DM, 76
    Delvin N’Dinga, DM/CM, 72
    Kamel Chafni, WM/CM, 72
    Valter Birsa, WM/CM, 74
    Roy Contout, WM/ST, 70
    Steeven Langil, WM, 68
    Frédéric Sammaritano, WM/CM, 66
    Alain Traoré, CM/W, 72
    Dennis Oliech, ST/WM, 74
    Ireneusz Jeleń, ST, 74
    Julien Quercia, ST, 70
    Daniel Niculae, ST, 72
  `),
].map((p) => ({ ...p, league: 'Ligue 1' as const }))

/** Left-footed players in these squads (not already in pools.ts). */
export const LEFT_FOOTED: string[] = [
  'Maxwell', 'Siaka Tiéné', 'Nenê', 'Layvin Kurzawa', 'Ángel Di María', 'Yuri Berchiche',
  'Presnel Kimpembe', 'Adrien Rabiot', 'Nuno Mendes', 'Juan Bernat', 'Lionel Messi', 'Fabián Ruiz',
  'Pablo Sarabia', 'Lucas Hernández', 'Willian Pacho', 'Lucas Beraldo', 'Lee Kang-in',
  'Eric Abidal', 'Thomas Lemar', 'Jorge', 'Rachid Ghezzal', 'Caio Henrique', 'Benoît Badiashile',
  'Ismail Jakobs', 'Kevin Volland', 'Michel Bastos', 'Kim Källström', 'Samuel Umtiti',
  'Henri Bedimo', 'Jérémy Morel', 'Nabil Fekir', 'Fernando Marçal', 'Bertrand Traoré',
  'Gabriel Heinze', 'Taye Taiwo', 'André Ayew', 'Florian Thauvin', 'Romain Alessandrini',
  'Jordan Amavi', 'Aymen Abdennour', 'Kostas Mitroglou', 'Luiz Gustavo', 'Ludovic Obraniak',
  'Fodé Ballo-Touré', 'Youssouf Koné', 'Nicolas Pépé', 'Luiz Araújo', 'Reinildo Mandava',
  'Domagoj Bradarić', 'Yusuf Yazıcı', 'Abdelhamid El Kaoutari', 'Faouzi Ghoulam', 'Jonathan Brison',
  'Gabriel Silva', 'Timothée Kolodziejczak', 'Benoît Trémoulinas', 'Florian Marange',
  'Fahid Ben Khalfallah', 'Dalbert', 'Maxime Le Marchand', 'Malang Sarr', 'Melvin Bard',
  'Calvin Stengs', 'Dante', 'Faitout Maouassa', 'Romain Del Castillo', 'Eduardo Camavinga',
  'Adrien Truffert', 'Arthur Theate', 'Facundo Medina', 'Deiver Machado', 'Massadio Haïdara',
  'Charles Traoré', 'Quentin Merlin', 'Gabriel Suazo', 'Valentín Barco', 'Dilane Bakwa',
  'Thibault De Smet', 'Bradley Locko', 'Lilian Brassier', 'Romain Faivre', 'Raphaël Guerreiro',
  'Vincent Le Goff', 'Arnold Bouka Moutou', 'Pierrick Capelle', 'Emmanuel Imorou',
  'Julian Palmieri', 'Ryad Boudebouz', 'Jérôme Rothen', 'Valter Birsa', 'Jérémy Berthod',
]

/** Weak foot where it isn't 3 stars (not already in pools.ts). */
export const WEAK_FOOT: Record<string, number> = {
  'Ousmane Dembélé': 5, 'Neymar': 5, 'Rayan Cherki': 5, 'Kylian Mbappé': 4, 'Lionel Messi': 4,
  'Marco Verratti': 4, 'Julian Draxler': 4, 'Memphis Depay': 4, 'Houssem Aouar': 4,
  'Aleksandr Golovin': 4, 'Wissam Ben Yedder': 4, 'Khvicha Kvaratskhelia': 4, 'Désiré Doué': 4,
  'Ángel Di María': 2, 'Florian Thauvin': 2, 'Nicolas Pépé': 2,
}

/** Archetypes of the best-known players (not already in pools.ts). */
export const ARCHETYPE: Record<string, Archetype> = {
  'Gianluigi Donnarumma': 'shotStopper', 'Keylor Navas': 'shotStopper',
  'Salvatore Sirigu': 'shotStopper', 'Kevin Trapp': 'sweeperKeeper',
  'Steve Mandanda': 'shotStopper', 'Anthony Lopes': 'shotStopper',
  'Danijel Subašić': 'shotStopper', 'Mike Maignan': 'sweeperKeeper', 'Marquinhos': 'ballPlayer',
  'Sergio Ramos': 'ballPlayer', 'Presnel Kimpembe': 'stopper', 'Alex': 'stopper',
  'Kamil Glik': 'stopper', 'Samuel Umtiti': 'ballPlayer', 'Adil Rami': 'stopper',
  'Dante': 'ballPlayer', 'Ricardo Carvalho': 'ballPlayer', 'Lucas Hernández': 'stopper',
  'Axel Disasi': 'stopper', 'Benoît Badiashile': 'ballPlayer', 'Jean-Clair Todibo': 'ballPlayer',
  'Achraf Hakimi': 'overlapping', 'Nuno Mendes': 'overlapping', 'Maxwell': 'overlapping',
  'Gregory van der Wiel': 'overlapping', 'Layvin Kurzawa': 'overlapping',
  'Dani Alves': 'overlapping', 'Thomas Meunier': 'overlapping', 'Djibril Sidibé': 'overlapping',
  'Mathieu Debuchy': 'overlapping', 'Hiroki Sakai': 'defensiveFullBack',
  'Raphaël Guerreiro': 'inverted', 'Thiago Motta': 'deepPlaymaker',
  'Maxime Gonalons': 'deepPlaymaker', 'Luiz Gustavo': 'anchor', 'Tiémoué Bakayoko': 'anchor',
  'Aurélien Tchouaméni': 'anchor', 'Yann M’Vila': 'deepPlaymaker', 'Jérémy Toulalan': 'anchor',
  'Danilo Pereira': 'anchor', 'Steven N’Zonzi': 'anchor', 'Lassana Diarra': 'ballWinner',
  'Marco Verratti': 'playmaker', 'Blaise Matuidi': 'boxToBox', 'Adrien Rabiot': 'boxToBox',
  'Javier Pastore': 'playmaker', 'Vitinha': 'playmaker', 'João Neves': 'boxToBox',
  'Fabián Ruiz': 'playmaker', 'Warren Zaïre-Emery': 'boxToBox', 'Yoann Gourcuff': 'playmaker',
  'Miralem Pjanić': 'playmaker', 'Corentin Tolisso': 'boxToBox', 'Houssem Aouar': 'playmaker',
  'Lucho González': 'playmaker', 'Morgan Sanson': 'boxToBox', 'Jean Michaël Seri': 'playmaker',
  'Younès Belhanda': 'playmaker', 'Youssouf Fofana': 'boxToBox', 'Seko Fofana': 'boxToBox',
  'Eduardo Camavinga': 'boxToBox', 'Renato Sanches': 'boxToBox', 'Lee Kang-in': 'playmaker',
  'Mathieu Valbuena': 'playmaker', 'Nabil Fekir': 'playmaker', 'Jonathan Ikoné': 'playmaker',
  'Thomas Lemar': 'winger', 'Aleksandr Golovin': 'winger', 'Calvin Stengs': 'insideForward',
  'Ángel Di María': 'insideForward', 'Neymar': 'insideForward', 'Lionel Messi': 'insideForward',
  'Ousmane Dembélé': 'winger', 'Khvicha Kvaratskhelia': 'insideForward',
  'Bradley Barcola': 'insideForward', 'Ezequiel Lavezzi': 'insideForward', 'Lucas Moura': 'winger',
  'Julian Draxler': 'insideForward', 'Jérémy Ménez': 'insideForward', 'Nenê': 'insideForward',
  'Michel Bastos': 'winger', 'Florian Thauvin': 'insideForward', 'Nicolas Pépé': 'insideForward',
  'André Ayew': 'insideForward', 'Gervinho': 'winger', 'Jonathan Bamba': 'winger',
  'Wahbi Khazri': 'insideForward', 'Lucas Ocampos': 'winger', 'Désiré Doué': 'winger',
  'Kylian Mbappé': 'poacher', 'Radamel Falcao': 'poacher', 'Alexandre Lacazette': 'poacher',
  'Lisandro López': 'poacher', 'Bafétimbi Gomis': 'targetMan', 'André-Pierre Gignac': 'targetMan',
  'Memphis Depay': 'falseNine', 'Moussa Dembélé': 'poacher', 'Wissam Ben Yedder': 'poacher',
  'Kevin Volland': 'poacher', 'Burak Yılmaz': 'targetMan', 'Jonathan David': 'poacher',
  'Loïs Openda': 'poacher', 'Randal Kolo Muani': 'poacher', 'Gonçalo Ramos': 'poacher',
  'Kevin Gameiro': 'poacher', 'Michy Batshuayi': 'poacher', 'Amine Gouiri': 'falseNine',
  'Andy Delort': 'targetMan', 'Kasper Dolberg': 'poacher', 'Martin Terrier': 'poacher',
  'Alassane Pléa': 'poacher', 'Hugo Ekitike': 'poacher', 'Brandão': 'targetMan',
  'Karl Toko Ekambi': 'poacher', 'Rafael Leão': 'poacher',
}
