/** Draft mode's Bundesliga clubs: squads of single seasons, 2010/11 to 2024/25 (see squads.ts). */
import type { Archetype } from '../engine/index.ts'
import { kit, pool, type Pool } from './squads.ts'

const RED = kit('#c8202f', '#ffffff', 'red')
const BVB = kit('#fde100', '#111111', 'yellow')
const B04 = kit('#e32221', '#111111', 'red')
const RBL = kit('#f2f2ee', '#dd0741', 'white')
const S04 = kit('#004d9d', '#ffffff', 'blue')
const WOB = kit('#65b32e', '#ffffff', 'green')
const BMG = kit('#f2f2ee', '#1a1a1a', 'white')
const HSV = kit('#f2f2ee', '#0a3a7a', 'white')
const SVW = kit('#1d9053', '#ffffff', 'green')
const BSC = kit('#004d9e', '#ffffff', 'blue')
const KOE = kit('#f2f2ee', '#ed1c24', 'white')
const H96 = kit('#c8102e', '#111111', 'red')
const FCN = kit('#8b1d2c', '#ffffff', 'red')
const FCK = kit('#c8202f', '#f2f2ee', 'red')
const SGE = kit('#1a1a1a', '#e1000f', 'black')
const VFB = kit('#f2f2ee', '#e32219', 'white')
const TSG = kit('#1961b5', '#ffffff', 'blue')
const SCF = kit('#e2001a', '#111111', 'red')
const FCU = kit('#d4011d', '#f6e02a', 'red')
const M05 = kit('#c3141e', '#ffffff', 'red')
const FCA = kit('#f2f2ee', '#ba3733', 'white')
const FCH = kit('#e2001a', '#003b79', 'red')

export const POOLS: Pool[] = [
  pool('Bayern Munich', 'FCB', '2012/13', RED, '4-2-3-1', `
    Manuel Neuer, GK, 88
    Tom Starke, GK, 72
    Jérôme Boateng, CB, 82
    Dante, CB, 83
    Daniel Van Buyten, CB, 80
    Holger Badstuber, CB/FB, 82
    Philipp Lahm, FB/DM, 88
    David Alaba, FB/CM, 80
    Rafinha, FB, 78
    Diego Contento, FB, 74
    Bastian Schweinsteiger, DM/CM, 87
    Javi Martínez, DM/CB, 84
    Luiz Gustavo, DM/CB, 81
    Anatoliy Tymoshchuk, DM/CB, 79
    Toni Kroos, CM/DM, 85
    Thomas Müller, CM/W/ST, 86
    Franck Ribéry, W/WM, 89
    Arjen Robben, W, 89
    Xherdan Shaqiri, W/CM, 79
    Mario Mandžukić, ST, 84
    Mario Gómez, ST, 87
    Claudio Pizarro, ST, 81
  `),
  pool('Bayern Munich', 'FCB', '2013/14', RED, '4-1-4-1', `
    Manuel Neuer, GK, 90
    Tom Starke, GK, 70
    Jérôme Boateng, CB, 84
    Dante, CB, 84
    Daniel Van Buyten, CB, 79
    Jan Kirchhoff, CB/DM, 72
    Philipp Lahm, DM/FB, 89
    Rafinha, FB, 79
    David Alaba, FB/CM, 83
    Diego Contento, FB, 74
    Bastian Schweinsteiger, DM/CM, 87
    Javi Martínez, DM/CB, 84
    Pierre-Emile Højbjerg, DM/CM, 68
    Thiago Alcântara, CM/DM, 84, Thiago
    Toni Kroos, CM, 85
    Thomas Müller, CM/ST/W, 86
    Mario Götze, CM/W/ST, 86
    Franck Ribéry, W, 90
    Arjen Robben, W, 90
    Xherdan Shaqiri, W, 80
    Mario Mandžukić, ST, 85
    Claudio Pizarro, ST, 79
  `),
  pool('Bayern Munich', 'FCB', '2016/17', RED, '4-3-3', `
    Manuel Neuer, GK, 92
    Sven Ulreich, GK, 75
    Tom Starke, GK, 69
    Jérôme Boateng, CB, 88
    Mats Hummels, CB, 88
    Javi Martínez, CB/DM, 85
    Philipp Lahm, FB/DM, 88
    David Alaba, FB/CM, 86
    Rafinha, FB, 78
    Juan Bernat, FB/WM, 79
    Joshua Kimmich, DM/FB/CB, 79
    Xabi Alonso, DM, 85
    Arturo Vidal, CM/DM, 87
    Thiago Alcântara, CM, 86, Thiago
    Renato Sanches, CM, 79
    Thomas Müller, CM/ST/W, 87
    Franck Ribéry, W, 86
    Arjen Robben, W, 89
    Douglas Costa, W, 84
    Kingsley Coman, W, 81
    Robert Lewandowski, ST, 90
  `),
  pool('Bayern Munich', 'FCB', '2019/20', RED, '4-2-3-1', `
    Manuel Neuer, GK, 88
    Sven Ulreich, GK, 76
    Jérôme Boateng, CB, 81
    Niklas Süle, CB, 85
    Lucas Hernández, CB/FB, 83
    Benjamin Pavard, FB/CB, 81
    David Alaba, CB/FB, 84
    Alphonso Davies, FB/W, 78
    Álvaro Odriozola, FB, 76
    Joshua Kimmich, DM/FB, 87
    Leon Goretzka, CM/DM, 84
    Thiago Alcântara, CM/DM, 86, Thiago
    Javi Martínez, DM/CB, 81
    Corentin Tolisso, CM, 82
    Michaël Cuisance, CM, 70
    Thomas Müller, CM/ST, 84
    Philippe Coutinho, CM/W, 86
    Serge Gnabry, W, 85
    Kingsley Coman, W, 85
    Ivan Perišić, W/WM/FB, 84
    Robert Lewandowski, ST, 89
    Joshua Zirkzee, ST, 64
  `),
  pool('Bayern Munich', 'FCB', '2023/24', RED, '4-2-3-1', `
    Manuel Neuer, GK, 87
    Sven Ulreich, GK, 72
    Kim Min-jae, CB, 86, Kim
    Dayot Upamecano, CB, 83
    Matthijs de Ligt, CB, 86
    Eric Dier, CB, 79
    Alphonso Davies, FB, 84
    Noussair Mazraoui, FB, 80
    Raphaël Guerreiro, FB/CM, 82
    Sacha Boey, FB, 77
    Joshua Kimmich, DM/FB, 88
    Leon Goretzka, CM/DM, 85
    Konrad Laimer, DM/CM, 81
    Aleksandar Pavlović, DM, 72
    Jamal Musiala, CM/W, 86
    Thomas Müller, CM/ST, 84
    Leroy Sané, W, 84
    Kingsley Coman, W, 84
    Serge Gnabry, W, 82
    Mathys Tel, ST/W, 74
    Harry Kane, ST, 90
    Eric Maxim Choupo-Moting, ST, 78
  `),
  pool('Borussia Dortmund', 'BVB', '2010/11', BVB, '4-2-3-1', `
    Roman Weidenfeller, GK, 81
    Mitchell Langerak, GK, 66
    Mats Hummels, CB, 80
    Neven Subotić, CB, 80
    Felipe Santana, CB, 72
    Łukasz Piszczek, FB, 77
    Marcel Schmelzer, FB, 74
    Patrick Owomoyela, FB, 72
    Dedê, FB, 72
    Nuri Şahin, DM/CM, 82
    Sven Bender, DM, 75
    Sebastian Kehl, DM, 78
    Antônio da Silva, CM, 72
    Shinji Kagawa, CM, 75
    Mario Götze, CM/W, 72
    Jakub Błaszczykowski, W/WM, 78
    Kevin Großkreutz, WM/W/FB, 74
    Lucas Barrios, ST, 82
    Robert Lewandowski, ST/CM, 74
    Mohamed Zidan, ST, 72
  `),
  pool('Borussia Dortmund', 'BVB', '2012/13', BVB, '4-2-3-1', `
    Roman Weidenfeller, GK, 83
    Mitchell Langerak, GK, 69
    Mats Hummels, CB, 84
    Neven Subotić, CB, 82
    Felipe Santana, CB, 76
    Łukasz Piszczek, FB, 81
    Marcel Schmelzer, FB, 79
    Chris Löwe, FB, 68
    Patrick Owomoyela, FB, 70
    Kevin Großkreutz, WM/FB, 78
    Sven Bender, DM, 80
    İlkay Gündoğan, DM/CM, 82
    Sebastian Kehl, DM, 78
    Nuri Şahin, CM/DM, 80
    Moritz Leitner, CM, 71
    Marco Reus, W/CM/ST, 85
    Mario Götze, CM/W, 85
    Jakub Błaszczykowski, W, 81
    Leonardo Bittencourt, W, 66
    Julian Schieber, ST, 74
    Robert Lewandowski, ST, 84
  `),
  pool('Borussia Dortmund', 'BVB', '2015/16', BVB, '4-3-3', `
    Roman Bürki, GK, 80
    Roman Weidenfeller, GK, 79
    Mats Hummels, CB, 87
    Sokratis Papastathopoulos, CB, 83, Sokratis
    Neven Subotić, CB, 80
    Matthias Ginter, CB/FB, 77
    Łukasz Piszczek, FB, 81
    Marcel Schmelzer, FB, 81
    Erik Durm, FB, 75
    Felix Passlack, FB, 64
    Julian Weigl, DM, 76
    Sven Bender, DM/CB, 80
    İlkay Gündoğan, CM, 84
    Gonzalo Castro, CM/DM, 80
    Shinji Kagawa, CM, 83
    Moritz Leitner, CM, 72
    Henrikh Mkhitaryan, CM/W, 84
    Marco Reus, W/ST, 87
    Christian Pulisic, W, 65
    Pierre-Emerick Aubameyang, ST/W, 84
    Adrián Ramos, ST, 77
  `),
  pool('Borussia Dortmund', 'BVB', '2018/19', BVB, '4-2-3-1', `
    Roman Bürki, GK, 84
    Marwin Hitz, GK, 76
    Manuel Akanji, CB, 80
    Abdou Diallo, CB, 79
    Dan-Axel Zagadou, CB, 73
    Ömer Toprak, CB, 79
    Łukasz Piszczek, FB, 80
    Achraf Hakimi, FB, 76
    Marcel Schmelzer, FB, 78
    Raphaël Guerreiro, FB/CM, 81
    Axel Witsel, DM, 84
    Thomas Delaney, DM/CM, 79
    Julian Weigl, DM/CB, 81
    Mahmoud Dahoud, CM, 78
    Marco Reus, CM/W/ST, 88
    Mario Götze, CM, 81
    Jadon Sancho, W, 79
    Christian Pulisic, W, 79
    Jacob Bruun Larsen, W, 70
    Paco Alcácer, ST, 80
    Maximilian Philipp, ST/W, 77
  `),
  pool('Borussia Dortmund', 'BVB', '2020/21', BVB, '4-2-3-1', `
    Roman Bürki, GK, 83
    Marwin Hitz, GK, 76
    Mats Hummels, CB, 87
    Manuel Akanji, CB, 81
    Emre Can, DM/CB, 82
    Thomas Meunier, FB, 81
    Raphaël Guerreiro, FB/CM, 84
    Łukasz Piszczek, FB/CB, 76
    Nico Schulz, FB, 77
    Mateu Morey, FB, 69
    Axel Witsel, DM, 85
    Thomas Delaney, DM, 79
    Mahmoud Dahoud, CM, 78
    Jude Bellingham, CM, 74
    Julian Brandt, CM/W, 83
    Marco Reus, CM/W, 86
    Giovanni Reyna, CM/W, 74
    Jadon Sancho, W, 87
    Thorgan Hazard, W, 82
    Ansgar Knauff, W, 65
    Erling Haaland, ST, 84
    Youssoufa Moukoko, ST, 62
  `),
  pool('Bayer Leverkusen', 'B04', '2015/16', B04, '4-4-2', `
    Bernd Leno, GK, 81
    Ramazan Özcan, GK, 73
    Ömer Toprak, CB, 80
    Jonathan Tah, CB, 75
    Kyriakos Papadopoulos, CB, 78
    Tin Jedvaj, FB/CB, 74
    Roberto Hilbert, FB, 74
    Wendell, FB, 77
    Sebastian Boenisch, FB, 72
    Christoph Kramer, DM, 79
    Lars Bender, DM/FB, 82
    Charles Aránguiz, DM/CM, 81
    Kevin Kampl, CM/W, 79
    Hakan Çalhanoğlu, CM/W, 81
    Julian Brandt, W, 74
    Karim Bellarabi, W, 81
    Admir Mehmedi, W/ST, 76
    Javier Hernández, ST, 83, Chicharito
    Stefan Kießling, ST, 81
    Joel Pohjanpalo, ST, 68
  `),
  pool('Bayer Leverkusen', 'B04', '2019/20', B04, '4-3-3', `
    Lukáš Hrádecký, GK, 83
    Niklas Lomb, GK, 65
    Sven Bender, CB, 79
    Jonathan Tah, CB, 81
    Edmond Tapsoba, CB, 74
    Aleksandar Dragović, CB, 76
    Lars Bender, FB/DM, 80
    Mitchell Weiser, FB, 74
    Wendell, FB, 78
    Daley Sinkgraven, FB, 72
    Charles Aránguiz, DM, 83
    Julian Baumgartlinger, DM, 77
    Kerem Demirbay, CM, 80
    Exequiel Palacios, CM, 74
    Nadiem Amiri, CM, 76
    Kai Havertz, CM/ST, 84
    Karim Bellarabi, W, 79
    Moussa Diaby, W, 74
    Leon Bailey, W, 80
    Paulinho, W, 70
    Kevin Volland, ST/W, 81
    Lucas Alario, ST, 76
  `),
  pool('Bayer Leverkusen', 'B04', '2023/24', B04, '3-4-3', `
    Lukáš Hrádecký, GK, 85
    Matěj Kovář, GK, 74
    Jonathan Tah, CB, 85
    Edmond Tapsoba, CB, 81
    Piero Hincapié, CB/FB, 80
    Odilon Kossounou, CB, 79
    Josip Stanišić, FB/CB, 79
    Jeremie Frimpong, FB/WM, 84
    Alejandro Grimaldo, FB/WM, 85, Grimaldo
    Granit Xhaka, DM, 84
    Exequiel Palacios, CM/DM, 81
    Robert Andrich, DM, 80
    Florian Wirtz, CM/W, 88
    Jonas Hofmann, CM/W, 82
    Amine Adli, W/ST, 77
    Nathan Tella, W, 75
    Victor Boniface, ST, 81
    Patrik Schick, ST, 82
    Borja Iglesias, ST, 77
    Adam Hložek, ST/W, 75
  `),
  pool('RB Leipzig', 'RBL', '2016/17', RBL, '4-4-2', `
    Péter Gulácsi, GK, 79
    Fabio Coltorti, GK, 70
    Willi Orban, CB, 77
    Marvin Compper, CB, 76
    Dayot Upamecano, CB, 70
    Lukas Klostermann, FB, 75
    Marcel Halstenberg, FB, 74
    Benno Schmitz, FB, 70
    Diego Demme, DM, 76
    Stefan Ilsanker, DM/CB, 74
    Naby Keïta, CM, 79
    Kevin Kampl, CM, 79
    Dominik Kaiser, CM, 74
    Zsolt Kalmár, CM, 66
    Emil Forsberg, WM/CM, 79
    Marcel Sabitzer, CM/WM, 79
    Oliver Burke, W, 70
    Timo Werner, ST, 79
    Yussuf Poulsen, ST, 75
    Davie Selke, ST, 74
  `),
  pool('RB Leipzig', 'RBL', '2019/20', RBL, '3-4-3', `
    Péter Gulácsi, GK, 85
    Yvon Mvogo, GK, 72
    Dayot Upamecano, CB, 82
    Ibrahima Konaté, CB, 78
    Lukas Klostermann, CB/FB, 80
    Willi Orban, CB, 79
    Marcel Halstenberg, FB/CB, 80
    Nordi Mukiele, FB/CB, 78
    Angeliño, FB, 79
    Konrad Laimer, DM/CM, 80
    Kevin Kampl, CM, 81
    Marcel Sabitzer, CM, 82
    Tyler Adams, DM/FB, 74
    Amadou Haidara, CM, 76
    Christopher Nkunku, CM/W, 80
    Dani Olmo, CM/W, 79
    Emil Forsberg, CM, 81
    Ademola Lookman, W, 72
    Timo Werner, ST, 87
    Yussuf Poulsen, ST, 78
    Patrik Schick, ST, 78
  `),
  pool('RB Leipzig', 'RBL', '2022/23', RBL, '4-4-2', `
    Janis Blaswich, GK, 76
    Péter Gulácsi, GK, 85
    Willi Orban, CB, 82
    Joško Gvardiol, CB/FB, 84
    Mohamed Simakan, CB/FB, 79
    Lukas Klostermann, CB/FB, 79
    Abdou Diallo, CB, 78
    Marcel Halstenberg, FB/CB, 79
    David Raum, FB, 82
    Benjamin Henrichs, FB, 79
    Konrad Laimer, DM/CM, 82
    Kevin Kampl, CM/DM, 80
    Xaver Schlager, CM, 81
    Amadou Haidara, CM, 78
    Dominik Szoboszlai, CM/W, 81
    Dani Olmo, CM, 82
    Emil Forsberg, CM, 80
    Christopher Nkunku, ST/CM, 86
    Timo Werner, ST/W, 81
    André Silva, ST, 80
    Yussuf Poulsen, ST, 78
  `),
  pool('Schalke 04', 'S04', '2010/11', S04, '4-4-2', `
    Manuel Neuer, GK, 84
    Mathias Schober, GK, 68
    Christoph Metzelder, CB, 77
    Benedikt Höwedes, CB/FB, 76
    Kyriakos Papadopoulos, CB, 70
    Joël Matip, CB/DM, 70
    Atsuto Uchida, FB, 74
    Hans Sarpei, FB, 72
    Sergio Escudero, FB, 70
    Lukas Schmitz, FB, 70
    Anthony Annan, DM, 73
    Peer Kluge, CM, 74
    José Manuel Jurado, CM/W, 80
    Alexander Baumjohann, CM, 72
    Ivan Rakitić, CM, 80
    Julian Draxler, CM, 64
    Jefferson Farfán, W/WM, 82
    Raúl González, ST, 83, Raúl
    Klaas-Jan Huntelaar, ST, 82
    Ciprian Marica, ST, 74
    Mario Gavranović, ST, 70
  `),
  pool('Schalke 04', 'S04', '2012/13', S04, '4-2-3-1', `
    Timo Hildebrand, GK, 77
    Lars Unnerstall, GK, 70
    Ralf Fährmann, GK, 72
    Benedikt Höwedes, CB, 82
    Kyriakos Papadopoulos, CB, 80
    Joël Matip, CB, 77
    Roman Neustädter, DM/CB, 78
    Atsuto Uchida, FB, 78
    Christian Fuchs, FB, 79
    Sead Kolašinac, FB, 65
    Marco Höger, DM/FB, 74
    Jermaine Jones, DM, 78
    Lewis Holtby, CM, 79
    Julian Draxler, CM/W, 77
    Tranquillo Barnetta, W/CM, 77
    Michel Bastos, W, 79
    Jefferson Farfán, W, 83
    Ibrahim Afellay, W, 77
    Klaas-Jan Huntelaar, ST, 84
    Ciprian Marica, ST, 74
    Teemu Pukki, ST, 72
  `),
  pool('Schalke 04', 'S04', '2017/18', S04, '3-5-2', `
    Ralf Fährmann, GK, 82
    Alexander Nübel, GK, 66
    Naldo, CB, 82
    Thilo Kehrer, CB/FB, 73
    Matija Nastasić, CB, 78
    Benjamin Stambouli, CB/DM, 77
    Daniel Caligiuri, WM/FB, 78
    Bastian Oczipka, FB/WM, 76
    Coke, FB, 75
    Leon Goretzka, CM, 83
    Max Meyer, DM/CM, 79
    Nabil Bentaleb, CM, 78
    Weston McKennie, CM, 68
    Amine Harit, CM/W, 77
    Yevhen Konoplyanka, W, 79
    Guido Burgstaller, ST, 78
    Breel Embolo, ST, 76
    Franco Di Santo, ST, 74
    Cedric Teuchert, ST, 68
  `),
  pool('VfL Wolfsburg', 'WOB', '2014/15', WOB, '4-2-3-1', `
    Diego Benaglio, GK, 83
    Max Grün, GK, 70
    Naldo, CB, 81
    Robin Knoche, CB, 74
    Timm Klose, CB, 76
    Ricardo Rodríguez, FB, 80
    Sebastian Jung, FB, 74
    Vieirinha, WM/FB, 77
    Marcel Schäfer, FB, 75
    Luiz Gustavo, DM, 83
    Josuha Guilavogui, DM, 77
    Junior Malanda, DM, 70
    Maximilian Arnold, CM, 74
    Kevin De Bruyne, CM/W, 86
    Aaron Hunt, CM, 79
    Ivan Perišić, W, 81
    Daniel Caligiuri, WM, 77
    André Schürrle, W, 82
    Bas Dost, ST, 77
    Nicklas Bendtner, ST, 75
    Ivica Olić, ST, 78
  `),
  pool('VfL Wolfsburg', 'WOB', '2020/21', WOB, '4-2-3-1', `
    Koen Casteels, GK, 82
    Pavao Pervan, GK, 72
    Maxence Lacroix, CB, 76
    John Brooks, CB, 78
    Marin Pongračić, CB, 75
    Jérôme Roussillon, FB, 76
    Ridle Baku, FB/CM, 76
    Kevin Mbabu, FB, 78
    Paulo Otávio, FB, 73
    Xaver Schlager, CM, 79
    Maximilian Arnold, DM, 80
    Josuha Guilavogui, DM, 78
    Yannick Gerhardt, CM/FB, 76
    Renato Steffen, W, 76
    Josip Brekalo, W, 78
    Admir Mehmedi, CM/ST, 76
    Maximilian Philipp, W/ST, 76
    Wout Weghorst, ST, 81
    Daniel Ginczek, ST, 75
    Bartosz Białek, ST, 66
  `),
  pool('Borussia Mönchengladbach', 'BMG', '2014/15', BMG, '4-4-2', `
    Yann Sommer, GK, 82
    Christofer Heimeroth, GK, 70
    Martin Stranzl, CB, 79
    Álvaro Domínguez, CB, 78
    Roel Brouwers, CB, 74
    Tony Jantschke, FB/CB, 76
    Oscar Wendt, FB, 76
    Julian Korb, FB, 72
    Granit Xhaka, DM, 79
    Christoph Kramer, DM, 78
    Håvard Nordtveit, DM/CB, 76
    Patrick Herrmann, WM/W, 79
    Ibrahima Traoré, WM, 76
    André Hahn, WM, 78
    Thorgan Hazard, WM/CM, 75
    Fabian Johnson, WM/FB, 78
    Amin Younes, W, 68
    Raffael, ST/CM, 81
    Max Kruse, ST, 81
    Branimir Hrgota, ST, 70
    Peniel Mlapa, ST, 68
  `),
  pool('Borussia Mönchengladbach', 'BMG', '2019/20', BMG, '4-2-3-1', `
    Yann Sommer, GK, 85
    Tobias Sippel, GK, 70
    Matthias Ginter, CB, 82
    Nico Elvedi, CB, 80
    Tony Jantschke, CB, 74
    Louis Jordan Beyer, CB, 69
    Stefan Lainer, FB, 79
    Ramy Bensebaini, FB, 78
    Oscar Wendt, FB, 75
    Andreas Poulsen, FB, 66
    Denis Zakaria, DM, 80
    Christoph Kramer, DM, 79
    Florian Neuhaus, CM, 77
    Laszlo Bénes, CM, 70
    Jonas Hofmann, CM/W, 78
    Lars Stindl, CM/ST, 81
    Patrick Herrmann, W, 77
    Marcus Thuram, ST/W, 77
    Alassane Pléa, ST, 80
    Breel Embolo, ST, 78
  `),
  pool('Hamburger SV', 'HSV', '2010/11', HSV, '4-4-2', `
    Frank Rost, GK, 79
    Wolfgang Hesl, GK, 66
    Heiko Westermann, CB, 79
    Joris Mathijsen, CB, 80
    David Rozehnal, CB, 75
    Guy Demel, FB, 74
    Dennis Aogo, FB, 78
    Collin Benjamin, FB, 70
    Tomás Rincón, DM, 74
    Gojko Kačar, DM, 73
    David Jarolím, CM, 76
    Robert Tesche, CM, 68
    Zé Roberto, WM/CM, 80
    Piotr Trochowski, WM/CM, 78
    Marcell Jansen, WM/FB, 78
    Eljero Elia, W, 80
    Jonathan Pitroipa, W, 76
    Ruud van Nistelrooy, ST, 82
    Mladen Petrić, ST, 80
    Paolo Guerrero, ST, 78
    Son Heung-min, ST/W, 62, Son
  `),
  pool('Werder Bremen', 'SVW', '2010/11', SVW, '4-4-2', `
    Tim Wiese, GK, 82
    Christian Vander, GK, 68
    Per Mertesacker, CB, 82
    Naldo, CB, 82
    Sebastian Prödl, CB, 76
    Mikaël Silvestre, CB, 72
    Clemens Fritz, FB/CM, 76
    Petri Pasanen, FB, 72
    Sebastian Boenisch, FB, 72
    Torsten Frings, DM, 80
    Philipp Bargfrede, DM, 70
    Tim Borowski, CM, 76
    Daniel Jensen, CM, 74
    Wesley, CM, 74
    Aaron Hunt, CM/W, 78
    Marko Marin, W/CM, 82
    Marko Arnautović, ST/W, 74
    Claudio Pizarro, ST, 82
    Hugo Almeida, ST, 79
    Sandro Wagner, ST, 68
  `),
  pool('Werder Bremen', 'SVW', '2023/24', SVW, '3-5-2', `
    Michael Zetterer, GK, 74
    Jiří Pavlenka, GK, 76
    Marco Friedl, CB, 76
    Miloš Veljković, CB, 74
    Niklas Stark, CB, 75
    Amos Pieper, CB, 74
    Anthony Jung, FB/CB, 72
    Mitchell Weiser, WM/FB, 77
    Felix Agu, WM/FB, 72
    Olivier Deman, FB, 72
    Senne Lynen, DM, 75
    Christian Groß, DM, 72
    Jens Stage, CM, 77
    Romano Schmid, CM, 76
    Leonardo Bittencourt, CM, 74
    Naby Keïta, CM, 78
    Marvin Ducksch, ST, 78
    Rafael Borré, ST, 77
    Justin Njinmah, ST, 72
    Nick Woltemade, ST, 70
    Dawid Kownacki, ST, 72
  `),
  pool('Hertha BSC', 'BSC', '2016/17', BSC, '4-2-3-1', `
    Rune Jarstein, GK, 78
    Thomas Kraft, GK, 72
    Sebastian Langkamp, CB, 75
    John Brooks, CB, 77
    Niklas Stark, CB/DM, 74
    Fabian Lustenberger, CB/DM, 74
    Mitchell Weiser, FB, 74
    Peter Pekarík, FB, 72
    Marvin Plattenhardt, FB, 76
    Per Skjelbred, DM, 74
    Vladimír Darida, CM, 76
    Ondrej Duda, CM, 74
    Arne Maier, CM, 64
    Genki Haraguchi, WM, 74
    Valentin Stocker, CM/WM, 74
    Alexander Esswein, WM, 72
    Salomon Kalou, W/ST, 78
    Vedad Ibišević, ST, 78
    Julian Schieber, ST, 72
    Sami Allagui, ST, 70
  `),
  pool('1. FC Köln', 'KOE', '2016/17', KOE, '4-4-2', `
    Timo Horn, GK, 79
    Thomas Kessler, GK, 68
    Dominique Heintz, CB, 75
    Frederik Sørensen, CB, 72
    Dominic Maroh, CB, 72
    Mergim Mavraj, CB, 74
    Jonas Hector, FB/CM, 81
    Pawel Olkowski, FB, 70
    Konstantin Rausch, FB, 70
    Matthias Lehmann, DM, 76
    Marco Höger, DM, 75
    Salih Özcan, CM, 66
    Miloš Jojić, CM, 73
    Marcel Risse, WM/FB, 76
    Leonardo Bittencourt, WM, 75
    Christian Clemens, WM, 72
    Yuya Osako, ST/CM, 75
    Anthony Modeste, ST, 79
    Artjoms Rudņevs, ST, 72
    Simon Zoller, ST/WM, 72
  `),
  pool('Hannover 96', 'H96', '2010/11', H96, '4-4-2', `
    Ron-Robert Zieler, GK, 74
    Florian Fromlowitz, GK, 72
    Markus Miller, GK, 70
    Karim Haggui, CB, 76
    Emanuel Pogatetz, CB, 75
    Mario Eggimann, CB, 73
    Christian Schulz, FB/CB, 73
    Steven Cherundolo, FB, 78
    Konstantin Rausch, FB/WM, 70
    Sofian Chahed, FB, 70
    Manuel Schmiedebach, DM, 72
    Leon Andreasen, DM, 72
    Sérgio Pinto, CM, 74
    Lars Stindl, CM, 70
    Jan Rosenthal, CM, 70
    Jan Schlaudraff, WM, 75
    Moritz Stoppelkamp, WM, 70
    Didier Ya Konan, ST, 78
    Mohammed Abdellaoue, ST, 77
    Mike Hanke, ST, 74
  `),
  pool('1. FC Nürnberg', 'FCN', '2010/11', FCN, '4-2-3-1', `
    Raphael Schäfer, GK, 77
    Alexander Stephan, GK, 66
    Andreas Wolf, CB, 74
    Philipp Wollscheid, CB, 70
    Per Nilsson, CB, 72
    Dominic Maroh, CB, 70
    Javier Pinola, FB, 75
    Juri Judt, FB, 70
    Timothy Chandler, FB, 68
    Timmy Simons, DM, 76
    Jens Hegeler, CM, 68
    Mehmet Ekici, CM, 74
    İlkay Gündoğan, CM, 73
    Daniel Didavi, CM, 68
    Mike Frantz, WM, 70
    Robert Mak, W, 68
    Albert Bunjaku, ST, 72
    Christian Eigler, ST, 72
    Julian Schieber, ST, 70
    Marek Mintál, ST, 72
  `),
  pool('1. FC Kaiserslautern', 'FCK', '2010/11', FCK, '4-2-3-1', `
    Tobias Sippel, GK, 72
    Kevin Trapp, GK, 64
    Rodnei, CB, 72
    Martin Amedick, CB, 72
    Jan Šimůnek, CB, 70
    Mathias Abel, CB, 68
    Florian Dick, FB, 70
    Alexander Bugera, FB, 68
    Leon Jessen, FB, 66
    Thanos Petsos, DM, 66
    Oliver Kirch, DM, 68
    Christian Tiffert, CM, 74
    Pierre De Wit, CM/DM, 68
    Clemens Walch, CM, 68
    Ivo Iličević, WM/W, 72
    Srđan Lakić, ST, 75
    Adam Nemec, ST, 70
    Erwin Hoffer, ST, 70
    Ilian Micanski, ST, 68
    Richard Sukuta-Pasu, ST, 66
  `),
  pool('Mainz 05', 'M05', '2010/11', M05, '4-3-3', `
    Heinz Müller, GK, 74
    Christian Wetklo, GK, 70
    Nikolče Noveski, CB, 74
    Bo Svensson, CB, 72
    Niko Bungert, CB, 70
    Jan Kirchhoff, CB, 66
    Radoslav Zabavník, FB, 72
    Christian Fuchs, FB, 76
    Malik Fathi, FB, 70
    Tim Hoogland, FB, 70
    Eugen Polanski, DM, 72
    Marco Caligiuri, DM, 70
    Elkin Soto, CM, 74
    Lewis Holtby, CM, 74
    Andreas Ivanschitz, CM/WM, 76
    Florian Heller, WM, 68
    André Schürrle, W, 74
    Sami Allagui, ST/W, 74
    Ádám Szalai, ST, 72
    Anthony Ujah, ST, 66
  `),
  pool('FC Augsburg', 'FCA', '2014/15', FCA, '4-2-3-1', `
    Marwin Hitz, GK, 79
    Alexander Manninger, GK, 74
    Ragnar Klavan, CB, 76
    Jan-Ingwer Callsen-Bracker, CB, 72
    Christoph Janker, CB, 70
    Paul Verhaegh, FB, 75
    Dominik Reinhardt, FB, 70
    Matthias Ostrzolek, FB, 72
    Daniel Baier, DM, 77
    Dominik Kohr, DM, 72
    Pierre-Emile Højbjerg, CM/DM, 74
    Markus Feulner, CM, 72
    Halil Altıntop, CM/WM, 75
    Tobias Werner, WM, 74
    Alexander Esswein, WM, 73
    Caiuby, W, 72
    Ji Dong-won, ST/CM, 72, Ji
    Raúl Bobadilla, ST, 75
    Sascha Mölders, ST, 72
    Tim Matavž, ST, 73
  `),
  pool('Eintracht Frankfurt', 'SGE', '2018/19', SGE, '3-5-2', `
    Kevin Trapp, GK, 82
    Frederik Rønnow, GK, 76
    Makoto Hasebe, CB/DM, 79
    Martin Hinteregger, CB, 79
    Evan Ndicka, CB, 74
    David Abraham, CB, 78
    Simon Falette, CB, 72
    Marco Russ, CB, 72
    Danny da Costa, FB/WM, 77
    Filip Kostić, WM/W, 79
    Timothy Chandler, FB, 74
    Gelson Fernandes, DM, 75
    Lucas Torró, DM, 72
    Sebastian Rode, CM, 76
    Jonathan de Guzmán, CM, 75
    Mijat Gaćinović, CM/W, 74
    Ante Rebić, ST/W, 80
    Luka Jović, ST, 78
    Sébastien Haller, ST, 80
    Gonçalo Paciência, ST, 73
  `),
  pool('Eintracht Frankfurt', 'SGE', '2021/22', SGE, '3-4-3', `
    Kevin Trapp, GK, 84
    Diant Ramaj, GK, 66
    Jens Grahl, GK, 66
    Tuta, CB, 76
    Evan Ndicka, CB, 79
    Martin Hinteregger, CB, 81
    Almamy Touré, CB/FB, 74
    Makoto Hasebe, CB/DM, 76
    Timothy Chandler, FB, 72
    Christopher Lenz, FB, 73
    Filip Kostić, WM, 84
    Ansgar Knauff, WM/W, 74
    Djibril Sow, CM, 78
    Kristijan Jakić, DM, 75
    Sebastian Rode, CM, 76
    Daichi Kamada, CM, 80
    Ajdin Hrustić, CM, 73
    Jesper Lindstrøm, W/CM, 76
    Jens Petter Hauge, W, 74
    Rafael Borré, ST, 78
    Sam Lammers, ST, 72
  `),
  pool('VfB Stuttgart', 'VFB', '2023/24', VFB, '4-4-2', `
    Alexander Nübel, GK, 80
    Fabian Bredlow, GK, 70
    Waldemar Anton, CB, 80
    Hiroki Ito, CB/FB, 78
    Dan-Axel Zagadou, CB, 76
    Anthony Rouault, CB, 72
    Leonidas Stergiou, CB/FB, 72
    Maximilian Mittelstädt, FB, 78
    Josha Vagnoman, FB, 74
    Pascal Stenzel, FB, 72
    Atakan Karazor, DM, 76
    Angelo Stiller, DM/CM, 79
    Mahmoud Dahoud, CM, 77
    Enzo Millot, CM, 77
    Chris Führich, WM/W, 78
    Jamie Leweling, WM, 74
    Silas, W, 76
    Jeong Woo-yeong, CM/W, 72, Jeong
    Serhou Guirassy, ST, 83
    Deniz Undav, ST, 80
  `),
  pool('TSG Hoffenheim', 'TSG', '2017/18', TSG, '3-5-2', `
    Oliver Baumann, GK, 82
    Alexander Stolz, GK, 66
    Kevin Vogt, CB/DM, 78
    Benjamin Hübner, CB, 77
    Håvard Nordtveit, CB/DM, 76
    Ermin Bičakčić, CB, 75
    Stefan Posch, CB, 68
    Pavel Kadeřábek, FB/WM, 78
    Nico Schulz, FB/WM, 77
    Steven Zuber, WM, 75
    Florian Grillitsch, DM, 75
    Kerem Demirbay, CM, 79
    Nadiem Amiri, CM, 75
    Dennis Geiger, CM, 70
    Lukas Rupp, CM, 74
    Serge Gnabry, W/CM, 80
    Andrej Kramarić, ST/CM, 82
    Mark Uth, ST, 78
    Sandro Wagner, ST, 80
    Ádám Szalai, ST, 75
  `),
  pool('SC Freiburg', 'SCF', '2021/22', SCF, '3-4-3', `
    Mark Flekken, GK, 79
    Benjamin Uphoff, GK, 68
    Nico Schlotterbeck, CB, 80
    Philipp Lienhart, CB, 78
    Manuel Gulde, CB, 74
    Keven Schlotterbeck, CB, 72
    Lukas Kübler, FB, 74
    Christian Günter, FB/WM, 78
    Jonathan Schmid, WM/FB, 74
    Kiliann Sildillia, FB, 66
    Nicolas Höfler, DM, 76
    Maximilian Eggestein, CM, 77
    Yannik Keitel, CM, 70
    Janik Haberer, CM, 72
    Vincenzo Grifo, W/CM, 80
    Roland Sallai, W/ST, 76
    Kevin Schade, ST/W, 70
    Nils Petersen, ST, 75
    Lucas Höler, ST, 76
    Ermedin Demirović, ST, 75
  `),
  pool('Union Berlin', 'FCU', '2022/23', FCU, '3-5-2', `
    Frederik Rønnow, GK, 79
    Lennart Grill, GK, 70
    Robin Knoche, CB, 78
    Danilho Doekhi, CB, 76
    Diogo Leite, CB, 76
    Paul Jaeckel, CB, 72
    Christopher Trimmel, FB/WM, 78
    Niko Gießelmann, WM/FB, 74
    Jérôme Roussillon, FB, 76
    Josip Juranović, FB, 78
    Rani Khedira, DM, 78
    Janik Haberer, CM, 74
    Genki Haraguchi, CM, 74
    Aïssa Laïdouni, CM, 76
    András Schäfer, CM, 74
    Paul Seguin, CM, 72
    Jamie Leweling, W, 70
    Sheraldo Becker, ST/W, 77
    Jordan Siebatcheu, ST, 76
    Kevin Behrens, ST, 74
    Sven Michel, ST, 70
  `),
  pool('1. FC Heidenheim', 'FCH', '2023/24', FCH, '4-2-3-1', `
    Kevin Müller, GK, 74
    Vitus Eicher, GK, 66
    Patrick Mainka, CB, 73
    Tim Siersleben, CB, 70
    Benedikt Gimber, CB, 71
    Jonas Föhrenbach, FB, 70
    Marnon Busch, FB, 70
    Omar Traoré, FB, 70
    Lennard Maloney, DM, 71
    Jan Schöppner, DM/CM, 70
    Norman Theuerkauf, CM/FB, 69
    Adrian Beck, CM, 70
    Kevin Sessa, CM, 71
    Nikola Dovedan, CM, 69
    Jan-Niklas Beste, WM, 75
    Eren Dinkçi, W, 72
    Denis Thomalla, W, 67
    Marvin Pieringer, ST/CM, 71
    Tim Kleindienst, ST, 75
    Stefan Schimmer, ST, 67
  `),
].map((p) => ({ ...p, league: 'Bundesliga' as const }))

/** Left-footed players in these squads (not already in pools.ts). */
export const LEFT_FOOTED: string[] = [
  'David Alaba', 'Diego Contento', 'Arjen Robben', 'Xherdan Shaqiri', 'Juan Bernat',
  'Douglas Costa', 'Lucas Hernández', 'Alphonso Davies', 'Michaël Cuisance', 'Raphaël Guerreiro',
  'Luiz Gustavo', 'Marcel Schmelzer', 'Nuri Şahin', 'Antônio da Silva', 'Dedê', 'Chris Löwe',
  'Abdou Diallo', 'Dan-Axel Zagadou', 'Nico Schulz', 'Wendell', 'Sebastian Boenisch',
  'Kerem Demirbay', 'Daley Sinkgraven', 'Paulinho', 'Kevin Volland', 'Piero Hincapié',
  'Alejandro Grimaldo', 'Granit Xhaka', 'Patrik Schick', 'Victor Boniface', 'Marcel Halstenberg',
  'Angeliño', 'David Raum', 'Sergio Escudero', 'Lukas Schmitz', 'Michel Bastos', 'Sead Kolašinac',
  'Lewis Holtby', 'Bastian Oczipka', 'Nabil Bentaleb', 'Ricardo Rodríguez', 'Marcel Schäfer',
  'Maximilian Arnold', 'Jérôme Roussillon', 'Paulo Otávio', 'Yannick Gerhardt', 'Renato Steffen',
  'Álvaro Domínguez', 'Oscar Wendt', 'Max Kruse', 'Branimir Hrgota', 'Ramy Bensebaini',
  'Andreas Poulsen', 'Joris Mathijsen', 'Dennis Aogo', 'Marcell Jansen', 'Zé Roberto',
  'Mladen Petrić', 'Mikaël Silvestre', 'John Brooks', 'Marvin Plattenhardt', 'Valentin Stocker',
  'Dominique Heintz', 'Konstantin Rausch', 'Miloš Jojić', 'Christian Schulz', 'Emanuel Pogatetz',
  'Javier Pinola', 'Daniel Didavi', 'Martin Hinteregger', 'Evan Ndicka', 'Simon Falette',
  'Filip Kostić', 'Christopher Lenz', 'Ajdin Hrustić', 'Hiroki Ito', 'Maximilian Mittelstädt',
  'Nico Schlotterbeck', 'Christian Günter', 'Diogo Leite', 'Niko Gießelmann',
  'Andreas Ivanschitz', 'Malik Fathi', 'Ragnar Klavan', 'Matthias Ostrzolek', 'Tobias Werner',
  'Jonas Föhrenbach', 'Norman Theuerkauf', 'Jan-Niklas Beste', 'Nikola Dovedan',
  'Alexander Bugera', 'Leon Jessen', 'Marco Friedl', 'Anthony Jung', 'Olivier Deman',
  'Steven Zuber', 'Mark Uth',
]

/** Weak foot where it isn't 3 stars (not already in pools.ts). */
export const WEAK_FOOT: Record<string, number> = {
  'Toni Kroos': 5, 'Ivan Perišić': 5, 'Thomas Müller': 4, 'Robert Lewandowski': 4,
  'Mario Götze': 4, 'Marco Reus': 4, 'Joshua Kimmich': 4, 'Jamal Musiala': 4, 'Florian Wirtz': 4,
  'Bastian Schweinsteiger': 4, 'Arturo Vidal': 4, 'Achraf Hakimi': 4, 'Julian Brandt': 4,
  'Henrikh Mkhitaryan': 4, 'Christopher Nkunku': 4, 'Emil Forsberg': 4, 'Daichi Kamada': 4,
  'David Alaba': 4, 'Pierre-Emerick Aubameyang': 4, 'Andrej Kramarić': 4, 'Franck Ribéry': 4,
  'Philipp Lahm': 4, 'Shinji Kagawa': 4, 'Arjen Robben': 2, 'Douglas Costa': 2, 'Filip Kostić': 2,
  'Alejandro Grimaldo': 2,
}

/** Archetypes of the best-known players (not already in pools.ts). */
export const ARCHETYPE: Record<string, Archetype> = {
  // Keepers.
  'Manuel Neuer': 'sweeperKeeper', 'Yann Sommer': 'sweeperKeeper', 'Péter Gulácsi': 'shotStopper',
  'Roman Bürki': 'shotStopper', 'Lukáš Hrádecký': 'shotStopper', 'Kevin Trapp': 'shotStopper',
  'Roman Weidenfeller': 'shotStopper',
  // Centre-backs.
  'Jérôme Boateng': 'ballPlayer', 'Mats Hummels': 'ballPlayer', 'Edmond Tapsoba': 'ballPlayer',
  'Matthias Ginter': 'ballPlayer', 'Nico Schlotterbeck': 'ballPlayer', 'Dante': 'stopper',
  'Dayot Upamecano': 'stopper', 'Kim Min-jae': 'stopper', 'Matthijs de Ligt': 'stopper',
  'Niklas Süle': 'stopper', 'Neven Subotić': 'stopper', 'Sokratis Papastathopoulos': 'stopper',
  'Naldo': 'stopper', 'Jonathan Tah': 'stopper', 'Willi Orban': 'stopper',
  'Martin Hinteregger': 'stopper', 'Benedikt Höwedes': 'stopper', 'Lucas Hernández': 'stopper',
  // Full-backs.
  'Philipp Lahm': 'inverted', 'Raphaël Guerreiro': 'inverted', 'David Alaba': 'overlapping',
  'Alphonso Davies': 'overlapping', 'Łukasz Piszczek': 'overlapping',
  'Marcel Schmelzer': 'overlapping', 'Achraf Hakimi': 'overlapping',
  'Jeremie Frimpong': 'overlapping', 'Alejandro Grimaldo': 'overlapping',
  'Ricardo Rodríguez': 'overlapping', 'Angeliño': 'overlapping', 'David Raum': 'overlapping',
  'Nico Schulz': 'overlapping', 'Noussair Mazraoui': 'overlapping', 'Rafinha': 'defensiveFullBack',
  'Benjamin Pavard': 'defensiveFullBack', 'Lukas Klostermann': 'defensiveFullBack',
  // Holding midfielders.
  'Bastian Schweinsteiger': 'deepPlaymaker', 'Xabi Alonso': 'deepPlaymaker',
  'Joshua Kimmich': 'deepPlaymaker', 'Axel Witsel': 'deepPlaymaker',
  'Julian Weigl': 'deepPlaymaker', 'Nuri Şahin': 'deepPlaymaker', 'Javi Martínez': 'anchor',
  'Luiz Gustavo': 'anchor', 'Sebastian Kehl': 'anchor', 'Christoph Kramer': 'anchor',
  'Sven Bender': 'ballWinner', 'Charles Aránguiz': 'ballWinner', 'Robert Andrich': 'ballWinner',
  'Konrad Laimer': 'ballWinner', 'Lars Bender': 'ballWinner',
  // Central and attacking midfielders.
  'Toni Kroos': 'playmaker', 'Mario Götze': 'playmaker', 'Henrikh Mkhitaryan': 'playmaker',
  'Jamal Musiala': 'playmaker', 'Florian Wirtz': 'playmaker', 'Christopher Nkunku': 'playmaker',
  'Dani Olmo': 'playmaker', 'Kerem Demirbay': 'playmaker', 'Hakan Çalhanoğlu': 'playmaker',
  'Julian Draxler': 'playmaker', 'Mahmoud Dahoud': 'playmaker', 'Ivan Rakitić': 'playmaker',
  'Julian Brandt': 'playmaker', 'Thomas Müller': 'boxToBox', 'Arturo Vidal': 'boxToBox',
  'Leon Goretzka': 'boxToBox', 'Jude Bellingham': 'boxToBox', 'Marcel Sabitzer': 'boxToBox',
  'Kevin Kampl': 'boxToBox', 'Jonas Hofmann': 'boxToBox',
  // Wide players.
  'Arjen Robben': 'insideForward', 'Franck Ribéry': 'insideForward',
  'Xherdan Shaqiri': 'insideForward', 'Marco Reus': 'insideForward',
  'Emil Forsberg': 'insideForward', 'Vincenzo Grifo': 'insideForward',
  'Jesper Lindstrøm': 'insideForward', 'Kingsley Coman': 'winger', 'Douglas Costa': 'winger',
  'Jakub Błaszczykowski': 'winger', 'Thorgan Hazard': 'winger', 'Karim Bellarabi': 'winger',
  'Jefferson Farfán': 'winger', 'Filip Kostić': 'winger',
  // Strikers.
  'Robert Lewandowski': 'poacher', 'Mario Gómez': 'poacher', 'Lucas Barrios': 'poacher',
  'Klaas-Jan Huntelaar': 'poacher', 'Paco Alcácer': 'poacher', 'Patrik Schick': 'poacher',
  'André Silva': 'poacher', 'Kevin Volland': 'poacher', 'Luka Jović': 'poacher',
  'Ante Rebić': 'poacher', 'Marcus Thuram': 'poacher', 'Serhou Guirassy': 'poacher',
  'Ruud van Nistelrooy': 'poacher', 'Mario Mandžukić': 'targetMan', 'Claudio Pizarro': 'targetMan',
  'Yussuf Poulsen': 'targetMan', 'Victor Boniface': 'targetMan', 'Wout Weghorst': 'targetMan',
  'Stefan Kießling': 'targetMan', 'Sébastien Haller': 'targetMan', 'Anthony Modeste': 'targetMan',
  'Eric Maxim Choupo-Moting': 'targetMan', 'Raúl González': 'falseNine', 'Raffael': 'falseNine',
  'Max Kruse': 'falseNine', 'Andrej Kramarić': 'falseNine', 'Alassane Pléa': 'falseNine',
  'Deniz Undav': 'falseNine',
}
