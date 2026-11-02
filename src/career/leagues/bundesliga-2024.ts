/**
 * The Bundesliga 2024/25 for a real career: the eighteen clubs (34 matchdays) and their first-team
 * squads at the end of the summer window (1 September 2024; loans at the club they went to). One
 * player a line: `Name, POS[/POS…], overall, born, foot[, known as]`, spelled as in the draft's
 * squads files; overalls are our estimate of his EA FC 25 rating. See premier-league-2024.ts.
 */
import type { RealClub } from '../real.ts'
import { kit } from '../../draft/squads.ts'

export const SEASON = 2024

export const CLUBS: RealClub[] = [
  {
    club: 'Bayern Munich', shortName: 'FCB', kit: kit('#c8202f', '#ffffff', 'red'), formation: '4-2-3-1', players: `
    Manuel Neuer, GK, 86, 1986, R
    Sven Ulreich, GK, 72, 1988, R
    Daniel Peretz, GK, 70, 2000, R
    Dayot Upamecano, CB, 82, 1998, R
    Kim Min-jae, CB, 84, 1996, R, Kim
    Eric Dier, CB, 78, 1994, R
    Hiroki Ito, CB/FB, 79, 1999, L
    Josip Stanišić, FB/CB, 77, 2000, R
    Sacha Boey, FB, 77, 2000, R
    Alphonso Davies, FB, 83, 2000, L
    Raphaël Guerreiro, FB/CM, 80, 1993, L
    Joshua Kimmich, DM/FB, 86, 1995, R
    João Palhinha, DM, 84, 1995, R
    Aleksandar Pavlović, DM/CM, 78, 2004, L
    Leon Goretzka, CM, 82, 1995, R
    Konrad Laimer, CM/FB, 80, 1997, R
    Jamal Musiala, CM/W, 88, 2003, R
    Thomas Müller, CM/ST, 82, 1989, R
    Michael Olise, W, 84, 2001, L
    Leroy Sané, W, 85, 1996, L
    Kingsley Coman, W, 84, 1996, R
    Serge Gnabry, W, 82, 1995, R
    Harry Kane, ST, 90, 1993, R
    Mathys Tel, ST/W, 74, 2005, R
  ` },
  {
    club: 'Bayer Leverkusen', shortName: 'B04', kit: kit('#e32221', '#111111', 'red'), formation: '3-4-3', players: `
    Lukáš Hrádecký, GK, 84, 1989, R
    Matěj Kovář, GK, 76, 2000, R
    Jonathan Tah, CB, 86, 1996, R
    Edmond Tapsoba, CB, 82, 1999, R
    Piero Hincapié, CB/FB, 82, 2002, L
    Jeanuël Belocian, CB, 72, 2005, L
    Nordi Mukiele, CB/FB, 78, 1997, R
    Arthur, FB, 72, 2003, R
    Jeremie Frimpong, FB/W, 84, 2000, R
    Alejandro Grimaldo, FB, 86, 1995, L, Grimaldo
    Granit Xhaka, CM/DM, 85, 1992, L
    Robert Andrich, DM, 81, 1994, R
    Exequiel Palacios, CM, 82, 1998, R
    Aleix García, DM/CM, 81, 1997, R
    Florian Wirtz, CM/W, 88, 2003, R
    Jonas Hofmann, CM/W, 81, 1992, R
    Amine Adli, W, 77, 2000, L
    Martin Terrier, W/ST, 79, 1997, R
    Nathan Tella, W, 76, 1999, R
    Patrik Schick, ST, 81, 1996, L
    Victor Boniface, ST, 82, 2000, L
    Gustavo Puerta, CM, 70, 2003, R
  ` },
  {
    club: 'Borussia Dortmund', shortName: 'BVB', kit: kit('#fde100', '#111111', 'yellow'), formation: '4-2-3-1', players: `
    Gregor Kobel, GK, 87, 1997, R
    Alexander Meyer, GK, 72, 1991, R
    Nico Schlotterbeck, CB, 84, 1999, L
    Niklas Süle, CB, 80, 1995, R
    Waldemar Anton, CB, 81, 1996, R
    Emre Can, DM/CB, 79, 1994, R
    Julian Ryerson, FB, 79, 1997, R
    Ramy Bensebaini, FB/CB, 78, 1995, L
    Yan Couto, FB, 78, 2002, R
    Marcel Sabitzer, CM, 82, 1994, R
    Pascal Groß, CM/DM, 81, 1991, R
    Felix Nmecha, CM, 78, 2000, R
    Salih Özcan, DM, 76, 1998, R
    Julian Brandt, CM/W, 84, 1996, R
    Giovanni Reyna, CM/W, 74, 2002, R
    Kjell Wätjen, CM, 64, 2006, R
    Jamie Gittens, W, 74, 2004, R
    Karim Adeyemi, W/ST, 79, 2002, R
    Donyell Malen, W/ST, 80, 1999, R
    Julien Duranville, W, 70, 2006, R
    Maximilian Beier, ST/W, 76, 2002, R
    Serhou Guirassy, ST, 82, 1996, R
  ` },
  {
    club: 'RB Leipzig', shortName: 'RBL', kit: kit('#f2f2ee', '#dd0741', 'white'), formation: '4-4-2', players: `
    Péter Gulácsi, GK, 82, 1990, R
    Maarten Vandevoordt, GK, 74, 2002, R
    Willi Orban, CB, 83, 1992, R
    Castello Lukeba, CB, 80, 2002, L
    Lukas Klostermann, CB/FB, 78, 1996, R
    El Chadaille Bitshiabu, CB, 70, 2005, L
    Lutsharel Geertruida, FB/CB, 79, 2000, R
    Benjamin Henrichs, FB, 78, 1997, R
    David Raum, FB, 80, 1998, L
    Xaver Schlager, CM/DM, 81, 1997, R
    Amadou Haidara, CM, 78, 1998, R
    Kevin Kampl, CM, 78, 1990, R
    Nicolas Seiwald, DM, 77, 2001, R
    Arthur Vermeeren, CM, 74, 2005, R
    Assan Ouédraogo, CM, 70, 2006, R
    Christoph Baumgartner, CM/W, 80, 1999, R
    Xavi Simons, CM/W, 84, 2003, R
    Eljif Elmas, CM/W, 77, 1999, R
    Antonio Nusa, W, 73, 2005, R
    Loïs Openda, ST, 84, 2000, R
    Benjamin Šeško, ST, 80, 2003, R
    Yussuf Poulsen, ST, 76, 1994, R
  ` },
  {
    club: 'VfB Stuttgart', shortName: 'VFB', kit: kit('#f2f2ee', '#e32219', 'white'), formation: '4-2-3-1', players: `
    Alexander Nübel, GK, 81, 1996, R
    Fabian Bredlow, GK, 70, 1995, R
    Jeff Chabot, CB, 77, 1998, L
    Anthony Rouault, CB, 77, 2001, R
    Dan-Axel Zagadou, CB, 77, 1999, L
    Leonidas Stergiou, CB/FB, 73, 2002, R
    Ramon Hendriks, CB, 70, 2001, L
    Maximilian Mittelstädt, FB, 80, 1997, L
    Josha Vagnoman, FB, 74, 2000, R
    Pascal Stenzel, FB, 72, 1996, R
    Atakan Karazor, DM, 77, 1996, R
    Angelo Stiller, DM/CM, 81, 2001, R
    Yannik Keitel, CM, 73, 2000, R
    Enzo Millot, CM/W, 79, 2002, R
    Fabian Rieder, CM/W, 75, 2002, L
    Chris Führich, W, 79, 1998, R
    Jamie Leweling, W, 77, 2001, R
    Justin Diehl, W, 66, 2004, R
    Nick Woltemade, ST/CM, 74, 2002, R
    Deniz Undav, ST, 81, 1996, R
    Ermedin Demirović, ST, 79, 1998, R
    El Bilal Touré, ST, 76, 2001, R
  ` },
  {
    club: 'Eintracht Frankfurt', shortName: 'SGE', kit: kit('#1a1a1a', '#e1000f', 'black'), formation: '4-2-3-1', players: `
    Kevin Trapp, GK, 82, 1990, R
    Kauã Santos, GK, 70, 2003, R
    Jens Grahl, GK, 64, 1988, R
    Robin Koch, CB, 80, 1996, R
    Tuta, CB, 78, 1999, R
    Arthur Theate, CB/FB, 77, 2000, L
    Aurèle Amenda, CB, 70, 2003, R
    Rasmus Kristensen, FB, 77, 1997, R
    Nathaniel Brown, FB, 70, 2003, L
    Niels Nkounkou, FB, 73, 2000, L
    Nnamdi Collins, CB/FB, 70, 2004, R
    Ellyes Skhiri, DM, 80, 1995, R
    Hugo Larsson, CM, 77, 2004, R
    Mario Götze, CM, 79, 1992, R
    Fares Chaïbi, CM/W, 75, 2002, R
    Oscar Højlund, CM, 64, 2005, R
    Junior Dina Ebimbe, W/CM, 76, 2000, R
    Ansgar Knauff, W, 75, 2002, R
    Can Uzun, CM/ST, 72, 2005, R
    Omar Marmoush, ST/W, 80, 1999, R
    Hugo Ekitike, ST, 77, 2002, R
    Igor Matanović, ST, 70, 2003, R
  ` },
  {
    club: 'SC Freiburg', shortName: 'SCF', kit: kit('#e2001a', '#111111', 'red'), formation: '4-2-3-1', players: `
    Noah Atubolu, GK, 76, 2002, R
    Florian Müller, GK, 72, 1997, R
    Matthias Ginter, CB, 80, 1994, R
    Philipp Lienhart, CB, 79, 1996, R
    Max Rosenfelder, CB, 71, 2003, L
    Kiliann Sildillia, CB/FB, 72, 2002, R
    Lukas Kübler, FB, 75, 1992, R
    Christian Günter, FB, 77, 1993, L
    Jordy Makengo, FB, 71, 2001, L
    Nicolas Höfler, DM, 76, 1990, R
    Maximilian Eggestein, CM, 78, 1996, R
    Patrick Osterhage, CM, 72, 2000, R
    Merlin Röhl, CM, 72, 2002, R
    Johan Manzambi, CM, 64, 2005, R
    Vincenzo Grifo, W, 79, 1993, R
    Ritsu Doan, W, 78, 1998, L
    Eren Dinkçi, W, 74, 2001, R
    Lucas Höler, ST, 76, 1994, R
    Michael Gregoritsch, ST, 77, 1994, L
    Junior Adamu, ST, 72, 2001, R
    Maximilian Philipp, ST/W, 72, 1994, R
    Bruno Ogbus, CB, 66, 2005, R
  ` },
  {
    club: 'Mainz 05', shortName: 'M05', kit: kit('#c3141e', '#ffffff', 'red'), formation: '3-4-3', players: `
    Robin Zentner, GK, 77, 1994, R
    Lasse Rieß, GK, 68, 2001, R
    Daniel Batz, GK, 66, 1991, R
    Stefan Bell, CB, 74, 1991, R
    Andreas Hanche-Olsen, CB, 75, 1997, R
    Dominik Kohr, CB/DM, 76, 1994, R
    Maxim Leitsch, CB, 74, 1998, L
    Moritz Jenz, CB, 73, 1999, L
    Danny da Costa, FB, 74, 1993, R
    Anthony Caci, FB, 74, 1997, L
    Silvan Widmer, FB, 75, 1993, R
    Phillipp Mwene, FB, 72, 1994, R
    Kaishu Sano, DM, 75, 2000, R
    Nadiem Amiri, CM, 77, 1996, R
    Lee Jae-sung, CM/W, 76, 1992, R, Lee
    Hong Hyun-seok, CM/W, 72, 1999, L, Hong
    Paul Nebel, CM/W, 72, 2002, L
    Gabriel Vidović, W/CM, 70, 2003, R
    Armindo Sieb, W, 70, 2003, R
    Jonathan Burkardt, ST, 78, 2000, R
    Ludovic Ajorque, ST, 75, 1994, L
    Nelson Weiper, ST, 69, 2005, R
  ` },
  {
    club: 'Borussia Mönchengladbach', shortName: 'BMG', kit: kit('#f2f2ee', '#1a1a1a', 'white'), formation: '4-2-3-1', players: `
    Moritz Nicolas, GK, 74, 1997, R
    Jonas Omlin, GK, 79, 1994, R
    Tobias Sippel, GK, 64, 1988, R
    Nico Elvedi, CB, 78, 1996, R
    Ko Itakura, CB, 79, 1997, R
    Marvin Friedrich, CB, 74, 1995, R
    Fabio Chiarodia, CB, 69, 2005, L
    Joe Scally, FB, 75, 2002, R
    Stefan Lainer, FB, 74, 1992, R
    Luca Netz, FB, 73, 2003, L
    Lukas Ullrich, FB, 70, 2004, L
    Julian Weigl, DM, 78, 1995, R
    Rocco Reitz, CM, 74, 2002, R
    Philipp Sander, CM, 72, 1998, R
    Florian Neuhaus, CM, 77, 1997, R
    Kevin Stöger, CM, 77, 1993, L
    Franck Honorat, W, 77, 1996, R
    Robin Hack, W/CM, 75, 1998, R
    Nathan Ngoumou, W, 72, 2000, R
    Alassane Pléa, ST/W, 77, 1993, R
    Tim Kleindienst, ST, 76, 1995, R
    Tomáš Čvančara, ST, 72, 2000, R
  ` },
  {
    club: 'VfL Wolfsburg', shortName: 'WOB', kit: kit('#65b32e', '#ffffff', 'green'), formation: '4-2-3-1', players: `
    Kamil Grabara, GK, 79, 1999, R
    Pavao Pervan, GK, 70, 1987, R
    Denis Vavro, CB, 76, 1996, R
    Konstantinos Koulierakis, CB, 74, 2003, L
    Sebastiaan Bornauw, CB, 74, 1999, R
    Cédric Zesiger, CB, 74, 1998, L
    Kilian Fischer, FB, 75, 2000, R
    Ridle Baku, FB, 77, 1998, R
    Joakim Mæhle, FB, 77, 1997, R
    Rogério, FB, 73, 1998, L
    Maximilian Arnold, DM/CM, 79, 1994, L
    Mattias Svanberg, CM, 77, 1999, R
    Lovro Majer, CM, 78, 1998, L
    Aster Vranckx, CM, 74, 2002, R
    Yannick Gerhardt, CM, 74, 1994, L
    Bence Dárdai, CM, 68, 2006, R
    Patrick Wimmer, W, 77, 2001, R
    Kevin Paredes, W/FB, 72, 2003, L
    Mohamed Amoura, ST/W, 77, 2000, R
    Tiago Tomás, ST/W, 73, 2002, R
    Jonas Wind, ST, 77, 1999, R
    Lukas Nmecha, ST, 74, 1998, R
  ` },
  {
    club: 'FC Augsburg', shortName: 'FCA', kit: kit('#f2f2ee', '#ba3733', 'white'), formation: '3-5-2', players: `
    Finn Dahmen, GK, 75, 1998, R
    Nediljko Labrović, GK, 75, 1999, R
    Tomáš Koubek, GK, 70, 1992, R
    Jeffrey Gouweleeuw, CB, 75, 1991, R
    Keven Schlotterbeck, CB, 74, 1997, L
    Chrislain Matsima, CB, 73, 2002, R
    Maximilian Bauer, CB, 72, 2000, R
    Mads Pedersen, FB, 74, 1996, L
    Dimitrios Giannoulis, FB, 73, 1995, L
    Kevin Mbabu, FB, 74, 1995, R
    Marius Wolf, FB/WM, 75, 1995, R
    Henri Koudossou, FB, 68, 1999, R
    Kristijan Jakić, DM/CM, 75, 1997, R
    Niklas Dorsch, DM, 74, 1998, R
    Elvis Rexhbeçaj, CM, 74, 1997, R
    Arne Maier, CM, 76, 1999, R
    Frank Onyeka, CM, 74, 1998, R
    Fredrik Jensen, CM/W, 73, 1997, R
    Mert Kömür, W, 66, 2005, R
    Alexis Claude-Maurice, W/CM, 75, 1998, R
    Rubén Vargas, W, 76, 1998, R
    Phillip Tietz, ST, 74, 1997, R
    Samuel Essende, ST, 73, 1998, R
    Yusuf Kabadayı, W, 66, 2004, R
  ` },
  {
    club: 'Union Berlin', shortName: 'FCU', kit: kit('#d4011d', '#f6e02a', 'red'), formation: '3-5-2', players: `
    Frederik Rønnow, GK, 78, 1992, R
    Alexander Schwolow, GK, 72, 1992, R
    Danilho Doekhi, CB, 77, 1998, R
    Diogo Leite, CB, 76, 1999, L
    Kevin Vogt, CB, 75, 1991, R
    Leopold Querfeld, CB, 74, 2003, R
    Paul Jaeckel, CB, 70, 1998, R
    Christopher Trimmel, FB, 74, 1987, R
    Josip Juranović, FB, 75, 1995, R
    Tom Rothe, FB, 70, 2004, L
    Robert Skov, FB/WM, 74, 1996, L
    Rani Khedira, DM, 77, 1994, R
    Lucas Tousart, DM/CM, 75, 1997, R
    Aljoscha Kemlein, CM, 70, 2004, R
    András Schäfer, CM, 74, 1999, R
    Janik Haberer, CM, 73, 1994, R
    Laszlo Bénes, CM, 74, 1997, L
    Jeong Woo-yeong, W/CM, 72, 1999, R, Jeong
    Benedict Hollerbach, ST/W, 73, 2001, R
    Yorbe Vertessen, ST, 72, 2001, R
    Tim Skarke, W, 70, 1996, R
    Kevin Volland, ST, 75, 1992, L
    Ivan Prtajin, ST, 71, 1996, R
  ` },
  {
    club: 'FC St. Pauli', shortName: 'STP', kit: kit('#5a3a27', '#ffffff', 'black'), formation: '3-4-3', players: `
    Nikola Vasilj, GK, 75, 1995, R
    Sascha Burchert, GK, 66, 1989, R
    Hauke Wahl, CB, 73, 1994, R
    Karol Mets, CB, 72, 1993, L
    Eric Smith, CB/DM, 74, 1997, R
    David Nemeth, CB, 71, 2001, L
    Adam Dźwigała, CB, 70, 1995, R
    Manolis Saliakas, FB, 73, 1996, R
    Philipp Treu, FB, 71, 2000, R
    Lars Ritzka, FB, 70, 1998, L
    Jackson Irvine, CM, 75, 1993, R
    Carlo Boukhalfa, CM, 70, 1999, R
    Connor Metcalfe, CM, 70, 1999, R
    Robert Wagner, CM, 68, 2003, R
    Danel Sinani, W/CM, 71, 1997, L
    Oladapo Afolayan, W, 71, 1997, R
    Elias Saad, W, 70, 1999, R
    Noah Weißhaupt, W, 68, 2001, R
    Morgan Guilavogui, ST/W, 70, 1998, R
    Johannes Eggestein, ST, 71, 1998, R
    Andreas Albers, ST, 69, 1990, R
    Erik Ahlstrand, W, 64, 2001, R
  ` },
  {
    club: 'TSG Hoffenheim', shortName: 'TSG', kit: kit('#1961b5', '#ffffff', 'blue'), formation: '3-4-3', players: `
    Oliver Baumann, GK, 80, 1990, R
    Luca Philipp, GK, 66, 2000, R
    Ozan Kabak, CB, 76, 2000, R
    Kevin Akpoguma, CB, 74, 1995, R
    Stanley Nsoki, CB, 74, 1999, L
    Attila Szalai, CB, 75, 1998, L
    Arthur Chaves, CB, 70, 2001, L
    Pavel Kadeřábek, FB, 75, 1992, R
    Valentin Gendrey, FB, 74, 2000, R
    Alexander Prass, FB/WM, 74, 2001, L
    David Jurásek, FB, 72, 2000, L
    Anton Stach, DM/CM, 77, 1998, R
    Florian Grillitsch, DM, 76, 1995, R
    Dennis Geiger, CM, 74, 1998, R
    Diadie Samassékou, DM, 73, 1996, R
    Tom Bischof, CM, 72, 2005, L
    Umut Tohumcu, CM, 68, 2004, R
    Marius Bülter, W, 74, 1993, R
    Adam Hložek, W/ST, 75, 2002, R
    Andrej Kramarić, ST/CM, 79, 1991, R
    Mërgim Berisha, ST, 74, 1998, R
    Haris Tabaković, ST, 74, 1994, R
    Ihlas Bebou, ST/W, 73, 1994, R
  ` },
  {
    club: '1. FC Heidenheim', shortName: 'FCH', kit: kit('#e2001a', '#003b79', 'red'), formation: '4-2-3-1', players: `
    Kevin Müller, GK, 75, 1991, R
    Frank Feller, GK, 66, 2004, R
    Patrick Mainka, CB, 74, 1994, R
    Benedikt Gimber, CB, 73, 1997, R
    Tim Siersleben, CB, 70, 2000, L
    Thomas Keller, CB, 69, 1999, R
    Jonas Föhrenbach, FB, 71, 1996, L
    Omar Traoré, FB, 72, 1998, R
    Marnon Busch, FB, 70, 1994, R
    Lennard Maloney, DM, 72, 1999, R
    Jan Schöppner, CM, 72, 1999, R
    Luca Kerber, CM, 69, 2002, R
    Adrian Beck, CM/W, 72, 1997, R
    Norman Theuerkauf, FB/CM, 67, 1987, L
    Paul Wanner, CM/W, 72, 2005, L
    Léo Scienza, W, 70, 1998, R
    Mathias Honsak, W, 70, 1996, R
    Sirlord Conteh, W, 68, 1996, R
    Marvin Pieringer, ST, 71, 1999, R
    Budu Zivzivadze, ST, 70, 1994, R
    Mikkel Kaufmann, ST, 69, 2001, R
    Stefan Schimmer, ST, 67, 1994, R
  ` },
  {
    club: 'Holstein Kiel', shortName: 'KSV', kit: kit('#004b9d', '#ffffff', 'blue'), formation: '3-4-3', players: `
    Timon Weiner, GK, 70, 1999, R
    Thomas Dähne, GK, 68, 1994, R
    Patrick Erras, CB/DM, 69, 1995, R
    Marco Komenda, CB, 68, 1996, R
    Carl Johansson, CB, 68, 1994, R
    Max Geschwill, CB, 67, 2001, R
    Marvin Schulz, CB/DM, 67, 1995, R
    Dominik Javorček, CB, 66, 2002, R
    Tymoteusz Puchacz, FB, 70, 1999, L
    Lasse Rosenboom, FB, 67, 2002, R
    Timo Becker, FB, 67, 1997, R
    Lewis Holtby, CM, 70, 1990, L
    Magnus Knudsen, CM, 68, 2001, R
    Nicolai Remberg, CM, 68, 2000, R
    Armin Gigović, CM, 69, 2002, R
    Marko Ivezić, CM, 67, 2000, R
    Finn Porath, W/CM, 69, 1997, R
    Alexander Bernhardsson, W, 69, 1998, R
    Steven Skrzybski, ST/W, 68, 1992, R
    Shuto Machino, ST, 70, 1999, R
    Phil Harres, ST, 67, 2002, R
    Benedikt Pichler, ST, 68, 1997, R
    Jann-Fiete Arp, ST, 66, 2000, R
  ` },
  {
    club: 'VfL Bochum', shortName: 'BOC', kit: kit('#005ca9', '#ffffff', 'blue'), formation: '4-4-2', players: `
    Patrick Drewes, GK, 72, 1993, R
    Timo Horn, GK, 72, 1993, R
    Ivan Ordets, CB, 72, 1992, R
    Erhan Mašović, CB, 72, 1998, R
    Jakov Medić, CB, 72, 1999, R
    Bernardo, CB/FB, 72, 1995, L
    Tim Oermann, CB/FB, 68, 2003, R
    Felix Passlack, FB, 70, 1998, R
    Maximilian Wittek, FB, 71, 1995, L
    Anthony Losilla, DM, 71, 1986, R
    Ibrahima Sissoko, DM/CM, 72, 1997, R
    Matúš Bero, CM, 72, 1995, R
    Dani de Wit, CM, 71, 1998, R
    Tom Krauß, CM, 71, 2001, R
    Lukas Daschner, CM/W, 70, 1998, R
    Koji Miyoshi, W/CM, 71, 1997, L
    Gerrit Holtmann, W, 70, 1995, L
    Agyemang Diawusie, W, 67, 1998, R
    Myron Boadu, ST, 72, 2001, R
    Philipp Hofmann, ST, 72, 1993, R
    Moritz Broschinski, ST, 69, 2000, R
    Gonçalo Paciência, ST, 70, 1994, R
  ` },
  {
    club: 'Werder Bremen', shortName: 'SVW', kit: kit('#1d9053', '#ffffff', 'green'), formation: '3-5-2', players: `
    Michael Zetterer, GK, 75, 1995, R
    Mio Backhaus, GK, 66, 2004, R
    Marco Friedl, CB, 77, 1998, L
    Niklas Stark, CB, 75, 1995, R
    Miloš Veljković, CB, 74, 1995, R
    Amos Pieper, CB, 73, 1998, R
    Julian Malatini, CB, 70, 2001, R
    Anthony Jung, CB/FB, 72, 1991, L
    Mitchell Weiser, FB, 77, 1994, R
    Felix Agu, FB, 73, 1999, R
    Olivier Deman, FB, 72, 2000, L
    Derrick Köhn, FB, 71, 1999, L
    Senne Lynen, DM, 75, 1999, R
    Jens Stage, CM, 77, 1996, R
    Romano Schmid, CM, 77, 2000, R
    Leonardo Bittencourt, CM, 74, 1993, R
    Skelly Alvero, CM, 71, 2002, R
    Isak Hansen-Aarøen, CM, 66, 2004, R
    Marco Grüll, W, 72, 1998, R
    Justin Njinmah, ST/W, 72, 2000, R
    Marvin Ducksch, ST, 76, 1994, R
    Keke Topp, ST, 68, 2004, R
    Oliver Burke, ST/W, 70, 1997, R
  ` },
]
