/**
 * The 2000s (session 37): club-seasons of all five leagues from 2000/01 to 2009/10, the sides people
 * remember (Arsenal's Invincibles, the Galácticos, Ronaldinho's Barcelona, Milan of Shevchenko and
 * Kaká, Lyon's seven titles). Added after every other pool, as saves refer to pools by index
 * (`p<pool>-<i>` ids). Same line format and standard as squads.ts: overalls are our estimate of the
 * FIFA rating that season. A man in several files is spelt the same in all of them.
 */
import type { Archetype } from '../engine/index.ts'
import { kit, pool, type League, type Pool } from './squads.ts'

const ARSENAL = kit('#c8202f', '#ffffff', 'red')
const UNITED = kit('#d0102b', '#ffffff', 'red')
const CHELSEA = kit('#1f3a8a', '#ffffff', 'blue')
const LIVERPOOL = kit('#c8102e', '#ffffff', 'red')
const NEWCASTLE = kit('#232527', '#f2f2ee', 'black')
const LEEDS = kit('#f2f2ee', '#1d4f9c', 'white')
const EVERTON = kit('#1b3f94', '#ffffff', 'blue')
const VILLA = kit('#7a1f2b', '#9fd3f0', 'red')
const POMPEY = kit('#1d4f9c', '#ffffff', 'blue')
const BOLTON = kit('#f2f2ee', '#1b2a4a', 'white')

const MADRID = kit('#f4f4f0', '#1b2a4a', 'white')
const BARCA = kit('#a50044', '#f0c330', 'red')
const VALENCIA = kit('#f4f4f0', '#111111', 'white')
const DEPOR = kit('#1d5fb4', '#ffffff', 'blue')
const SEVILLA = kit('#f4f4f0', '#d2152b', 'white')
const VILLARREAL = kit('#ffe667', '#004f9f', 'yellow')
const ATLETI = kit('#cb3524', '#ffffff', 'red')
const REAL_SOCIEDAD = kit('#1d5fb4', '#ffffff', 'blue')

const BAYERN = kit('#dc052d', '#ffffff', 'red')
const LEVERKUSEN = kit('#e32221', '#111111', 'red')
const DORTMUND = kit('#fde100', '#111111', 'yellow')
const WERDER = kit('#1d9053', '#ffffff', 'green')
const STUTTGART = kit('#f2f2ee', '#e32219', 'white')
const WOLFSBURG = kit('#65b32e', '#ffffff', 'green')
const SCHALKE = kit('#004d9d', '#ffffff', 'blue')

const MILAN = kit('#c8102e', '#111111', 'red')
const INTER = kit('#0a4595', '#111111', 'blue')
const JUVE = kit('#f2f2ee', '#111111', 'white')
const ROMA = kit('#8e1f2f', '#f0bc42', 'red')
const LAZIO = kit('#87d8f7', '#ffffff', 'blue')
const VIOLA = kit('#5b2a86', '#ffffff', 'purple')

const LYON = kit('#f2f2ee', '#1d3f9a', 'white')
const OM = kit('#f2f2ee', '#2faee0', 'white')
const MONACO = kit('#e2001a', '#ffffff', 'red')
const BORDEAUX = kit('#1a2340', '#ffffff', 'blue')
const AUXERRE = kit('#f2f2ee', '#1d4f9c', 'white')
const NANTES = kit('#fcd405', '#1d8a3c', 'yellow')

const of = (league: League, pools: Pool[]): Pool[] => pools.map((p) => ({ ...p, league }))

const PREMIER_LEAGUE: Pool[] = [
  pool('Arsenal', 'ARS', '2003/04', ARSENAL, '4-4-2', `
    Jens Lehmann, GK, 85
    Stuart Taylor, GK, 66
    Sol Campbell, CB, 87
    Kolo Touré, CB/FB, 82
    Martin Keown, CB, 78
    Pascal Cygan, CB, 75
    Philippe Senderos, CB, 66
    Lauren, FB, 82
    Ashley Cole, FB, 84
    Gaël Clichy, FB, 68
    Patrick Vieira, CM/DM, 90
    Gilberto Silva, DM, 84
    Edu, CM, 79
    Ray Parlour, CM/WM, 77
    Robert Pirès, WM/CM, 89
    Fredrik Ljungberg, WM/CM, 85
    Thierry Henry, ST, 93
    Dennis Bergkamp, ST, 87
    José Antonio Reyes, W/ST, 81
    Sylvain Wiltord, ST/WM, 82
    Kanu, ST, 78
    Jérémie Aliadière, ST, 67
  `),
  pool('Manchester United', 'MUN', '2007/08', UNITED, '4-4-2', `
    Edwin van der Sar, GK, 87
    Tomasz Kuszczak, GK, 75
    Rio Ferdinand, CB, 88
    Nemanja Vidić, CB, 87
    Wes Brown, CB/FB, 79
    Gerard Piqué, CB, 72
    Gary Neville, FB, 81
    Patrice Evra, FB, 84
    John O’Shea, FB/CB, 77
    Owen Hargreaves, DM/CM, 83
    Michael Carrick, CM, 83
    Paul Scholes, CM, 86
    Anderson, CM, 77
    Darren Fletcher, CM, 76
    Ryan Giggs, WM/CM, 85
    Ji-sung Park, WM, 78
    Nani, W, 80
    Cristiano Ronaldo, W/ST, 91
    Wayne Rooney, ST, 88
    Carlos Tevez, ST, 86
    Louis Saha, ST, 80
  `),
  pool('Chelsea', 'CHE', '2004/05', CHELSEA, '4-3-3', `
    Petr Čech, GK, 87
    Carlo Cudicini, GK, 83
    John Terry, CB, 88
    Ricardo Carvalho, CB, 85
    William Gallas, CB/FB, 84
    Robert Huth, CB, 72
    Paulo Ferreira, FB, 82
    Glen Johnson, FB, 75
    Wayne Bridge, FB, 80
    Claude Makélélé, DM, 88
    Frank Lampard, CM, 89
    Tiago Mendes, CM, 80
    Alexey Smertin, CM, 76
    Geremi, CM/FB, 77
    Joe Cole, W/CM, 82
    Arjen Robben, W, 86
    Damien Duff, W, 85
    Didier Drogba, ST, 85
    Eiður Guðjohnsen, ST/CM, 83, Guðjohnsen
    Mateja Kežman, ST, 81
  `),
  pool('Liverpool', 'LIV', '2008/09', LIVERPOOL, '4-2-3-1', `
    Pepe Reina, GK, 86
    Diego Cavalieri, GK, 70
    Jamie Carragher, CB, 84
    Martin Škrtel, CB, 80
    Daniel Agger, CB, 82
    Sami Hyypiä, CB, 79
    Álvaro Arbeloa, FB, 78
    Fábio Aurélio, FB, 78
    Andrea Dossena, FB, 75
    Javier Mascherano, DM, 85
    Xabi Alonso, CM/DM, 87
    Lucas Leiva, CM/DM, 75, Lucas
    Steven Gerrard, CM, 90
    Dirk Kuyt, W/ST, 81
    Albert Riera, W, 78
    Yossi Benayoun, W/CM, 79
    Ryan Babel, W/ST, 75
    Fernando Torres, ST, 90
    Robbie Keane, ST, 82
    David N’Gog, ST, 66
  `),
  pool('Newcastle United', 'NEW', '2001/02', NEWCASTLE, '4-4-2', `
    Shay Given, GK, 84
    Steve Harper, GK, 72
    Andy O’Brien, CB, 75
    Nikos Dabizas, CB, 76
    Sylvain Distin, CB, 73
    Aaron Hughes, CB/FB, 74
    Andy Griffin, FB, 71
    Robbie Elliott, FB, 72
    Olivier Bernard, FB/WM, 75
    Gary Speed, CM, 81
    Clarence Acuña, CM, 73
    Kieron Dyer, CM/WM, 80
    Jermaine Jenas, CM, 70
    Nolberto Solano, WM, 80
    Laurent Robert, WM, 82
    Alan Shearer, ST, 87
    Craig Bellamy, ST, 81
    Shola Ameobi, ST, 68
    Lomana LuaLua, ST, 71
    Carl Cort, ST, 71
  `),
  pool('Leeds United', 'LEE', '2000/01', LEEDS, '4-4-2', `
    Nigel Martyn, GK, 84
    Paul Robinson, GK, 72
    Rio Ferdinand, CB, 85
    Lucas Radebe, CB, 80
    Jonathan Woodgate, CB, 79
    Dominic Matteo, CB/FB, 78
    Gary Kelly, FB, 76
    Ian Harte, FB, 78
    Danny Mills, FB, 76
    David Batty, DM, 79
    Lee Bowyer, CM, 82
    Olivier Dacourt, CM, 81
    Eirik Bakke, CM, 75
    Harry Kewell, W/WM, 84
    Jason Wilcox, WM, 74
    Alan Smith, ST, 78
    Mark Viduka, ST, 84
    Robbie Keane, ST, 80
    Michael Bridges, ST, 76
  `),
  pool('Everton', 'EVE', '2004/05', EVERTON, '4-1-4-1', `
    Nigel Martyn, GK, 80
    Richard Wright, GK, 74
    David Weir, CB, 77
    Joseph Yobo, CB, 78
    Alan Stubbs, CB, 75
    Tony Hibbert, FB, 73
    Alessandro Pistone, FB, 73
    Gary Naysmith, FB, 73
    Lee Carsley, DM, 77
    Thomas Gravesen, CM, 80
    Tim Cahill, CM, 79
    Leon Osman, CM, 74
    Mikel Arteta, CM, 78
    Kevin Kilbane, WM, 75
    Steve Watson, WM/FB, 72
    James McFadden, W, 70
    Marcus Bent, ST, 74
    James Beattie, ST, 76
    Duncan Ferguson, ST, 72
  `),
  pool('Aston Villa', 'AVL', '2008/09', VILLA, '4-4-2', `
    Brad Friedel, GK, 82
    Brad Guzan, GK, 70
    Martin Laursen, CB, 80
    Curtis Davies, CB, 76
    Carlos Cuéllar, CB, 77
    Zat Knight, CB, 74
    Luke Young, FB, 77
    Nicky Shorey, FB, 74
    Wilfred Bouma, FB/CB, 76
    Gareth Barry, CM, 83
    Stiliyan Petrov, CM, 79
    Nigel Reo-Coker, CM, 76
    Steve Sidwell, CM, 74
    James Milner, WM/CM, 80
    Ashley Young, WM/W, 82
    Gabriel Agbonlahor, ST, 80
    John Carew, ST, 79
    Emile Heskey, ST, 77
    Marlon Harewood, ST, 73
  `),
  pool('Portsmouth', 'POR', '2007/08', POMPEY, '4-4-2', `
    David James, GK, 82
    Jamie Ashdown, GK, 66
    Sol Campbell, CB, 81
    Sylvain Distin, CB, 80
    Linvoy Primus, CB, 73
    Hermann Hreiðarsson, FB/CB, 74
    Glen Johnson, FB, 79
    Noé Pamarot, FB/CB, 73
    Lassana Diarra, DM, 80
    Papa Bouba Diop, DM, 77
    Sulley Muntari, CM, 79
    Pedro Mendes, CM, 77
    Sean Davis, CM, 72
    Niko Kranjčar, CM/WM, 79
    John Utaka, W, 77
    Jermain Defoe, ST, 82
    Benjani, ST, 76
    Kanu, ST, 75
    Milan Baroš, ST, 76
    David Nugent, ST, 72
  `),
  pool('Bolton Wanderers', 'BOL', '2005/06', BOLTON, '4-1-4-1', `
    Jussi Jääskeläinen, GK, 81
    Ali Al-Habsi, GK, 66
    Bruno N’Gotty, CB, 76
    Radhi Jaïdi, CB, 75
    Tal Ben Haim, CB, 76
    Nicky Hunt, FB, 72
    Ricardo Gardner, FB/WM, 74
    Abdoulaye Faye, DM/CB, 75
    Ivan Campo, DM/CB, 76
    Gary Speed, CM, 77
    Kevin Nolan, CM, 77
    Jay-Jay Okocha, CM, 80
    Hidetoshi Nakata, CM, 77
    Stelios Giannakopoulos, WM, 76, Stelios
    El Hadji Diouf, W/ST, 78
    Kevin Davies, ST, 77
    Henrik Pedersen, ST, 72
    Jared Borgetti, ST, 74
    Joey O’Brien, FB/CM, 66
  `),
]

const LA_LIGA: Pool[] = [
  pool('Real Madrid', 'RMA', '2002/03', MADRID, '4-4-2', `
    Iker Casillas, GK, 86
    César Sánchez, GK, 79
    Fernando Hierro, CB, 85
    Iván Helguera, CB/DM, 84
    Francisco Pavón, CB, 74
    Míchel Salgado, FB, 83
    Roberto Carlos, FB, 89
    Raúl Bravo, FB, 72
    Claude Makélélé, DM, 87
    Flávio Conceição, DM, 78
    Esteban Cambiasso, CM, 79
    Guti, CM/ST, 82
    Zinedine Zidane, CM, 94
    Luís Figo, W/WM, 91
    Santiago Solari, WM, 80
    Steve McManaman, WM/CM, 80
    Raúl González, ST, 90, Raúl
    Ronaldo Nazário, ST, 93, Ronaldo
    Fernando Morientes, ST, 84
    Javier Portillo, ST, 72
  `),
  pool('Real Madrid', 'RMA', '2007/08', MADRID, '4-4-2', `
    Iker Casillas, GK, 89
    Jerzy Dudek, GK, 77
    Pepe, CB, 84
    Fabio Cannavaro, CB, 87
    Christoph Metzelder, CB, 79
    Sergio Ramos, FB/CB, 86
    Míchel Salgado, FB, 79
    Marcelo, FB, 78
    Royston Drenthe, FB/WM, 75
    Mahamadou Diarra, DM, 83
    Fernando Gago, DM, 80
    Guti, CM, 84
    Wesley Sneijder, CM, 85
    Júlio Baptista, CM/ST, 79
    Arjen Robben, W, 86
    Robinho, W/ST, 85
    Raúl González, ST, 86, Raúl
    Ruud van Nistelrooy, ST, 89
    Gonzalo Higuaín, ST, 79
    Javier Saviola, ST, 78
  `),
  pool('Barcelona', 'BAR', '2005/06', BARCA, '4-3-3', `
    Víctor Valdés, GK, 84
    Albert Jorquera, GK, 70
    Carles Puyol, CB, 87
    Rafael Márquez, CB/DM, 85
    Oleguer, CB/FB, 75
    Juliano Belletti, FB, 80
    Giovanni van Bronckhorst, FB, 82
    Sylvinho, FB, 79
    Edmílson, DM/CB, 80
    Mark van Bommel, DM/CM, 82
    Deco, CM, 89
    Xavi Hernández, CM, 85
    Andrés Iniesta, CM/W, 82
    Thiago Motta, DM, 76
    Ronaldinho, W/CM, 94
    Lionel Messi, W, 82
    Ludovic Giuly, W, 84
    Samuel Eto’o, ST, 90
    Henrik Larsson, ST, 83
    Maxi López, ST, 72
  `),
  pool('Barcelona', 'BAR', '2008/09', BARCA, '4-3-3', `
    Víctor Valdés, GK, 86
    José Manuel Pinto, GK, 75
    Carles Puyol, CB/FB, 88
    Rafael Márquez, CB, 84
    Gerard Piqué, CB, 80
    Dani Alves, FB, 87
    Eric Abidal, FB/CB, 84
    Sylvinho, FB, 78
    Yaya Touré, DM/CM, 84
    Sergio Busquets, DM, 74
    Seydou Keita, CM/DM, 81
    Xavi Hernández, CM, 90
    Andrés Iniesta, CM/W, 89
    Aliaksandr Hleb, CM/W, 81
    Lionel Messi, W/ST, 90
    Thierry Henry, W/ST, 88
    Samuel Eto’o, ST, 88
    Bojan Krkić, ST/W, 76
    Eiður Guðjohnsen, ST/CM, 79, Guðjohnsen
  `),
  pool('Valencia', 'VAL', '2003/04', VALENCIA, '4-4-2', `
    Santiago Cañizares, GK, 86
    Andrés Palop, GK, 74
    Roberto Ayala, CB, 86
    Carlos Marchena, CB/DM, 80
    Mauricio Pellegrino, CB, 77
    Amedeo Carboni, FB, 79
    Curro Torres, FB, 77
    Fábio Aurélio, FB/WM, 77
    David Albelda, DM, 84
    Rubén Baraja, CM, 84
    Pablo Aimar, CM, 86
    Zlatko Zahovič, CM/ST, 76
    Vicente Rodríguez, WM, 85, Vicente
    Francisco Rufete, WM, 77
    Miguel Ángel Angulo, WM/ST, 78
    Mista, ST, 82
    Juan Sánchez, ST, 74
    Stefano Fiore, CM/WM, 78
    David Navarro, CB, 70
  `),
  pool('Deportivo La Coruña', 'DEP', '2003/04', DEPOR, '4-2-3-1', `
    José Molina, GK, 81
    Gustavo Munúa, GK, 72
    Noureddine Naybet, CB, 82
    Jorge Andrade, CB, 83
    César Martín, CB, 75
    Manuel Pablo, FB, 80
    Joan Capdevila, FB, 81
    Enrique Romero, FB, 74
    Lionel Scaloni, FB/CM, 77
    Mauro Silva, DM, 83
    Aldo Duscher, DM, 80
    Sergio González Soriano, CM, 80, Sergio
    Juan Carlos Valerón, CM, 87
    Fran, WM, 82
    Víctor Sánchez del Amo, WM, 79, Víctor
    Albert Luque, W/ST, 82
    Diego Tristán, ST, 84
    Walter Pandiani, ST, 79
    Pablo Amo, CB, 72
  `),
  pool('Sevilla', 'SEV', '2006/07', SEVILLA, '4-4-2', `
    Andrés Palop, GK, 82
    Javi Varas, GK, 66
    Javi Navarro, CB, 79
    Julien Escudé, CB, 80
    Ivica Dragutinović, CB/FB, 78
    Dani Alves, FB, 85
    David Castedo, FB, 72
    Christian Poulsen, DM, 81
    Enzo Maresca, CM, 79
    Renato, CM, 79
    Jesús Navas, WM, 81
    Adriano Correia, WM/FB, 79, Adriano
    Antonio Puerta, WM/FB, 78
    Diego Capel, WM, 74
    Duda, WM, 77
    Frédéric Kanouté, ST, 86
    Luís Fabiano, ST, 85
    Javier Chevantón, ST, 77
    Aitor Ocio, CB, 75
    Kepa Blanco, ST, 72
  `),
  pool('Villarreal', 'VIL', '2005/06', VILLARREAL, '4-2-3-1', `
    Sebastián Viera, GK, 79
    Mariano Barbosa, GK, 76
    Gonzalo Rodríguez, CB, 80
    Juan Manuel Peña, CB, 77
    Quique Álvarez, CB, 77
    Javi Venta, FB, 76
    Rodolfo Arruabarrena, FB, 77
    Marcos Senna, DM, 82
    Alessio Tacchinardi, DM, 80
    Josico, CM, 76
    Juan Román Riquelme, CM, 90
    Santi Cazorla, CM/WM, 72
    Juan Pablo Sorín, FB/WM, 82
    Roger García, WM, 76
    Héctor Font, WM, 72
    Diego Forlán, ST, 85
    José Mari Romero, ST, 74, José Mari
    Guillermo Franco, ST, 75
    César Arzo, CB, 72
  `),
  pool('Atlético Madrid', 'ATM', '2009/10', ATLETI, '4-4-2', `
    David de Gea, GK, 74
    Sergio Asenjo, GK, 76
    Tomáš Ujfaluši, CB/FB, 79
    Luis Perea, CB, 77
    Juanito, CB, 74
    Álvaro Domínguez, CB, 72
    Antonio López, FB, 76
    Mariano Pernía, FB, 74
    Paulo Assunção, DM, 78
    Tiago Mendes, CM, 77
    Raúl García, CM/ST, 77
    Ignacio Camacho, DM, 65
    José Antonio Reyes, W/WM, 79
    Simão, W/WM, 80
    Maxi Rodríguez, WM/CM, 80
    Eduardo Salvio, W, 70
    Sergio Agüero, ST, 87
    Diego Forlán, ST, 86
    Florent Sinama Pongolle, ST/W, 74
  `),
  pool('Real Sociedad', 'RSO', '2002/03', REAL_SOCIEDAD, '4-4-2', `
    Sander Westerveld, GK, 79
    Asier Riesgo, GK, 66
    Gabriel Schürrer, CB, 74
    Igor Jauregi, CB, 72
    Bjørn Tore Kvarme, CB, 75
    Agustín Aranzabal, FB, 77
    Alberto López Rekarte, FB, 74, López Rekarte
    Sergio Boris, FB/CB, 70
    Xabi Alonso, CM/DM, 83
    Mikel Aranburu, CM, 75
    Valery Karpin, WM/CM, 82
    Javier de Pedro, WM, 81
    Igor Gabilondo, WM, 74
    Darko Kovačević, ST, 84
    Nihat Kahveci, ST, 85, Nihat
    Jesuli, ST, 66
    Mikel Labaka, CB, 70
    Tayfun Korkut, CM, 75
    Luiz Alberto, CB, 73
  `),
]

const BUNDESLIGA: Pool[] = [
  pool('Bayern Munich', 'FCB', '2000/01', BAYERN, '4-4-2', `
    Oliver Kahn, GK, 92
    Bernd Dreher, GK, 70
    Samuel Kuffour, CB, 84
    Patrik Andersson, CB, 83
    Thomas Linke, CB, 80
    Willy Sagnol, FB, 81
    Bixente Lizarazu, FB, 85
    Michael Tarnat, FB/CM, 78
    Jens Jeremies, DM, 81
    Stefan Effenberg, CM, 87
    Thorsten Fink, CM, 76
    Owen Hargreaves, CM/DM, 72
    Ciriaco Sforza, CM, 78
    Mehmet Scholl, CM/WM, 86
    Hasan Salihamidžić, WM, 81
    Paulo Sérgio, W/ST, 80
    Giovane Élber, ST, 87
    Carsten Jancker, ST, 81
    Alexander Zickler, ST, 76
    Roque Santa Cruz, ST, 73
  `),
  pool('Bayern Munich', 'FCB', '2007/08', BAYERN, '4-4-2', `
    Oliver Kahn, GK, 86
    Michael Rensing, GK, 72
    Lúcio, CB, 87
    Martín Demichelis, CB/DM, 84
    Daniel Van Buyten, CB, 81
    Philipp Lahm, FB, 87
    Christian Lell, FB, 74
    Marcell Jansen, FB/WM, 78
    Willy Sagnol, FB, 80
    Mark van Bommel, DM/CM, 84
    Zé Roberto, CM/WM, 82
    Hamit Altıntop, FB/CM, 80
    Andreas Ottl, DM, 68
    Toni Kroos, CM, 68
    Bastian Schweinsteiger, WM/CM, 83
    Franck Ribéry, W, 89
    Luca Toni, ST, 88
    Miroslav Klose, ST, 86
    Lukas Podolski, W/ST, 81
    Jan Schlaudraff, ST, 70
  `),
  pool('Bayer Leverkusen', 'B04', '2001/02', LEVERKUSEN, '4-4-2', `
    Hans-Jörg Butt, GK, 84
    Frank Juric, GK, 70
    Jens Nowotny, CB, 85
    Lúcio, CB, 84
    Boris Živković, FB/CB, 79
    Diego Placente, FB, 79
    Thomas Kleine, CB, 70
    Carsten Ramelow, DM, 82
    Michael Ballack, CM, 89
    Yıldıray Baştürk, CM, 83
    Bernd Schneider, CM/WM, 85
    Zé Roberto, WM/CM, 83
    Marko Babić, WM, 76
    Daniel Bierofka, WM, 74
    Oliver Neuville, ST, 83
    Ulf Kirsten, ST, 81
    Dimitar Berbatov, ST, 75
    Thomas Brdarić, ST, 74
    Zoltán Sebescen, FB, 74
  `),
  pool('Borussia Dortmund', 'BVB', '2001/02', DORTMUND, '4-4-2', `
    Jens Lehmann, GK, 86
    Philipp Laux, GK, 70
    Christian Wörns, CB, 84
    Christoph Metzelder, CB, 80
    Jürgen Kohler, CB, 80
    Dedê, FB, 82
    Evanílson, FB, 79
    Stefan Reuter, FB/CM, 78
    Sebastian Kehl, DM, 80
    Jörg Heinrich, CM, 78
    Miroslav Stević, CM, 74
    Lars Ricken, CM, 79
    Tomáš Rosický, CM, 85
    Otto Addo, WM, 75
    Ewerthon, W/ST, 82
    Jan Koller, ST, 85
    Márcio Amoroso, ST, 85
    Heiko Herrlich, ST, 72
    Sunday Oliseh, DM, 76
  `),
  pool('Werder Bremen', 'SVW', '2003/04', WERDER, '4-4-2', `
    Andreas Reinke, GK, 80
    Pascal Borel, GK, 68
    Valérien Ismaël, CB, 82
    Mladen Krstajić, CB, 80
    Paul Stalteri, FB, 78
    Christian Schulz, FB/CB, 72
    Ludovic Magnin, FB, 76
    Frank Baumann, DM, 80
    Fabian Ernst, CM/DM, 81
    Tim Borowski, CM, 76
    Krisztián Lisztes, CM, 77
    Ümit Davala, CM/FB, 77
    Johan Micoud, CM, 88
    Aílton, ST, 85
    Ivan Klasnić, ST, 81
    Angelos Charisteas, ST, 76
    Nelson Valdez, ST, 71
    Viktor Skripnik, FB, 73
    Markus Daun, ST, 70
  `),
  pool('VfB Stuttgart', 'VFB', '2006/07', STUTTGART, '4-4-2', `
    Timo Hildebrand, GK, 85
    Michael Langer, GK, 64
    Fernando Meira, CB, 82
    Matthieu Delpierre, CB, 79
    Serdar Tasci, CB, 72
    Ricardo Osorio, FB/CB, 79
    Ludovic Magnin, FB, 77
    Andreas Beck, FB, 68
    Pavel Pardo, DM, 82
    Thomas Hitzlsperger, CM, 81
    Sami Khedira, CM, 70
    Antônio da Silva, CM, 76
    Christian Gentner, CM, 72
    Roberto Hilbert, WM, 77
    Alexander Farnerud, WM, 70
    Mario Gómez, ST, 82
    Cacau, ST, 79
    Ciprian Marica, ST, 77
    Jon Dahl Tomasson, ST, 79
  `),
  pool('VfL Wolfsburg', 'WOB', '2008/09', WOLFSBURG, '4-4-2', `
    Diego Benaglio, GK, 83
    André Lenz, GK, 68
    Andrea Barzagli, CB, 83
    Ricardo Costa, CB, 76
    Alexander Madlung, CB, 75
    Jan Šimůnek, CB, 72
    Sascha Riether, FB/WM, 75
    Marcel Schäfer, FB, 77
    Peter Pekarík, FB, 70
    Josué, DM, 79
    Makoto Hasebe, CM/FB, 74
    Christian Gentner, CM, 77
    Zvjezdan Misimović, CM, 84
    Ashkan Dejagah, W, 74
    Jonathan Santana, WM, 70
    Grafite, ST, 85
    Edin Džeko, ST, 84
    Marcelinho, CM/W, 76
    Cristian Zaccardo, FB/CB, 76
  `),
  pool('Schalke 04', 'S04', '2006/07', SCHALKE, '4-4-2', `
    Manuel Neuer, GK, 76
    Frank Rost, GK, 80
    Marcelo Bordon, CB, 84
    Mladen Krstajić, CB, 80
    Darío Rodríguez, CB/FB, 76
    Rafinha, FB, 79
    Christian Pander, FB, 76
    Levan Kobiashvili, FB/WM, 78
    Fabian Ernst, DM, 81
    Zlatan Bajramović, CM, 74
    Lincoln, CM, 85
    Mesut Özil, CM, 68
    Gustavo Varela, WM, 76
    Hamit Altıntop, WM/CM, 80
    Peter Løvenkrands, W, 76
    Kevin Kurányi, ST, 84
    Halil Altıntop, ST/WM, 78
    Søren Larsen, ST, 74
    Mathias Abel, CB, 72
  `),
]

const SERIE_A: Pool[] = [
  pool('AC Milan', 'MIL', '2003/04', MILAN, '4-4-2', `
    Dida, GK, 88
    Christian Abbiati, GK, 79
    Alessandro Nesta, CB, 91
    Paolo Maldini, CB/FB, 89
    Alessandro Costacurta, CB, 79
    Kakha Kaladze, CB/FB, 81
    Cafu, FB, 87
    Giuseppe Pancaro, FB, 77
    Andrea Pirlo, DM, 87
    Gennaro Gattuso, DM/CM, 85
    Clarence Seedorf, CM, 86
    Massimo Ambrosini, CM/DM, 79
    Cristian Brocchi, CM, 74
    Rui Costa, CM, 86
    Kaká, CM, 85
    Serginho, WM/FB, 78
    Andriy Shevchenko, ST, 92
    Filippo Inzaghi, ST, 85
    Jon Dahl Tomasson, ST, 80
  `),
  pool('AC Milan', 'MIL', '2006/07', MILAN, '4-4-2', `
    Dida, GK, 86
    Željko Kalac, GK, 75
    Alessandro Nesta, CB, 89
    Paolo Maldini, CB, 86
    Kakha Kaladze, CB/FB, 80
    Daniele Bonera, CB, 77
    Massimo Oddo, FB, 82
    Marek Jankulovski, FB, 81
    Cafu, FB, 81
    Andrea Pirlo, DM, 89
    Gennaro Gattuso, DM/CM, 85
    Clarence Seedorf, CM, 87
    Massimo Ambrosini, CM/DM, 81
    Yoann Gourcuff, CM, 75
    Kaká, CM, 92
    Filippo Inzaghi, ST, 83
    Alberto Gilardino, ST, 85
    Ronaldo Nazário, ST, 86, Ronaldo
    Ricardo Oliveira, ST, 78
  `),
  pool('Inter', 'INT', '2009/10', INTER, '4-2-3-1', `
    Júlio César, GK, 88
    Francesco Toldo, GK, 75
    Lúcio, CB, 88
    Walter Samuel, CB, 85
    Marco Materazzi, CB, 79
    Iván Córdoba, CB, 80
    Maicon, FB, 88
    Javier Zanetti, FB/CM, 87
    Cristian Chivu, FB/CB, 82
    Davide Santon, FB, 74
    Esteban Cambiasso, DM, 86
    Thiago Motta, DM, 82
    Dejan Stanković, CM, 84
    Sulley Muntari, CM, 79
    McDonald Mariga, CM, 70
    Wesley Sneijder, CM, 87
    Goran Pandev, W/ST, 82
    Samuel Eto’o, ST/W, 88
    Diego Milito, ST, 86
    Mario Balotelli, ST, 76
  `),
  pool('Juventus', 'JUV', '2002/03', JUVE, '4-4-2', `
    Gianluigi Buffon, GK, 90
    Antonio Chimenti, GK, 72
    Lilian Thuram, CB/FB, 89
    Paolo Montero, CB, 84
    Ciro Ferrara, CB, 82
    Mark Iuliano, CB, 80
    Igor Tudor, CB/DM, 78
    Gianluca Pessotto, FB, 79
    Gianluca Zambrotta, FB/WM, 85
    Edgar Davids, CM, 88
    Alessio Tacchinardi, DM, 80
    Antonio Conte, CM, 79
    Enzo Maresca, CM, 70
    Pavel Nedvěd, WM/CM, 91
    Mauro Camoranesi, WM, 83
    Alessandro Del Piero, ST, 90
    David Trezeguet, ST, 89
    Marcelo Salas, ST, 80
    Marco Di Vaio, ST, 80
  `),
  pool('Juventus', 'JUV', '2005/06', JUVE, '4-4-2', `
    Gianluigi Buffon, GK, 91
    Christian Abbiati, GK, 77
    Fabio Cannavaro, CB, 89
    Lilian Thuram, CB, 85
    Robert Kovač, CB, 79
    Giorgio Chiellini, FB/CB, 78
    Gianluca Zambrotta, FB, 86
    Jonathan Zebina, FB, 78
    Federico Balzaretti, FB, 72
    Emerson, DM, 85
    Patrick Vieira, CM, 88
    Giuliano Giannichedda, DM, 75
    Manuele Blasi, CM, 73
    Pavel Nedvěd, WM/CM, 88
    Mauro Camoranesi, WM, 84
    Adrian Mutu, W/ST, 81
    Alessandro Del Piero, ST, 87
    David Trezeguet, ST, 88
    Zlatan Ibrahimović, ST, 87
  `),
  pool('Roma', 'ROM', '2000/01', ROMA, '3-5-2', `
    Francesco Antonioli, GK, 80
    Cristiano Lupatelli, GK, 72
    Walter Samuel, CB, 84
    Aldair, CB, 83
    Antônio Carlos Zago, CB, 79
    Jonathan Zebina, CB/FB, 76
    Cafu, FB/WM, 88
    Vincent Candela, FB/WM, 85
    Gianni Guigou, WM/FB, 74
    Emerson, DM, 85
    Damiano Tommasi, CM, 81
    Cristiano Zanetti, CM, 78
    Hidetoshi Nakata, CM, 80
    Francesco Totti, ST/CM, 90
    Gabriel Batistuta, ST, 89
    Vincenzo Montella, ST, 85
    Marco Delvecchio, ST, 80
    Eusebio Di Francesco, CM, 75
    Amedeo Mangone, CB, 73
  `),
  pool('Lazio', 'LAZ', '2000/01', LAZIO, '4-4-2', `
    Angelo Peruzzi, GK, 86
    Luca Marchegiani, GK, 80
    Alessandro Nesta, CB, 90
    Siniša Mihajlović, CB, 85
    Fernando Couto, CB, 81
    Paolo Negro, CB/FB, 79
    Giuseppe Pancaro, FB, 79
    Giuseppe Favalli, FB, 78
    Diego Simeone, CM, 85
    Juan Sebastián Verón, CM, 89
    Dejan Stanković, CM, 80
    Roberto Baronio, CM, 74
    Pavel Nedvěd, WM/CM, 88
    Karel Poborský, WM, 78
    Hernán Crespo, ST, 88
    Marcelo Salas, ST, 85
    Claudio López, ST/W, 84
    Simone Inzaghi, ST, 79
    Guerino Gottardi, FB, 72
  `),
  pool('Fiorentina', 'FIO', '2007/08', VIOLA, '4-3-3', `
    Sébastien Frey, GK, 86
    Vlada Avramov, GK, 68
    Dario Dainelli, CB, 80
    Alessandro Gamberini, CB, 79
    Per Krøldrup, CB, 74
    Tomáš Ujfaluši, FB/CB, 80
    Manuel Pasqual, FB, 77
    Massimo Gobbi, FB/WM, 74
    Marco Donadel, DM, 75
    Fabio Liverani, CM, 79
    Riccardo Montolivo, CM, 81
    Zdravko Kuzmanović, CM, 78
    Martin Jørgensen, WM, 77
    Mario Santana, WM, 76
    Adrian Mutu, ST/W, 84
    Christian Vieri, ST, 79
    Giampaolo Pazzini, ST, 79
    Pablo Osvaldo, ST, 72
    Papa Waigo, ST, 70
  `),
]

const LIGUE_1: Pool[] = [
  pool('Lyon', 'OL', '2004/05', LYON, '4-3-3', `
    Grégory Coupet, GK, 86
    Rémy Vercoutre, GK, 72
    Cris, CB, 83
    Claudio Caçapa, CB, 80
    Patrick Müller, CB, 79
    Anthony Réveillère, FB, 78
    Eric Abidal, FB, 80
    Jérémy Berthod, FB, 72
    Mahamadou Diarra, DM, 82
    Michael Essien, CM, 85
    Juninho Pernambucano, CM, 88, Juninho
    Florent Malouda, WM/W, 83
    Sidney Govou, W, 80
    Sylvain Wiltord, W/ST, 82
    Giovane Élber, ST, 81
    Pierre-Alain Frau, ST, 76
    Nilmar, ST, 75
    Bryan Bergougnoux, ST, 70
    Jérémy Clément, CM, 68
  `),
  pool('Lyon', 'OL', '2007/08', LYON, '4-3-3', `
    Grégory Coupet, GK, 85
    Rémy Vercoutre, GK, 73
    Cris, CB, 84
    Sébastien Squillaci, CB, 80
    Jean-Alain Boumsong, CB, 78
    François Clerc, FB, 76
    Anthony Réveillère, FB, 78
    Fabio Grosso, FB, 81
    Jérémy Toulalan, DM, 83
    Juninho Pernambucano, CM, 87, Juninho
    Kim Källström, CM, 82
    Mathieu Bodmer, CM, 77
    Sidney Govou, W, 81
    Hatem Ben Arfa, W, 79
    Kader Keita, W, 80
    Karim Benzema, ST, 85
    Fred Chaves Guedes, ST, 79, Fred
    Milan Baroš, ST, 78
    Loïc Rémy, ST, 68
  `),
  pool('Marseille', 'OM', '2008/09', OM, '4-3-3', `
    Steve Mandanda, GK, 82
    Cédric Carrasso, GK, 75
    Gaël Givet, CB, 79
    Ronald Zubar, CB, 75
    Julien Rodriguez, CB, 74
    Laurent Bonnart, FB, 76
    Taye Taiwo, FB, 78
    Lorik Cana, DM, 80
    Charles Kaboré, DM, 72
    Benoît Cheyrou, CM, 79
    Modeste M’Bami, CM, 74
    Karim Ziani, CM/WM, 78
    Mathieu Valbuena, W/CM, 77
    Hatem Ben Arfa, W, 80
    Bakari Koné, W, 78
    Mamadou Niang, ST, 81
    Brandão, ST, 74
    Vitorino Hilton, CB, 77, Hilton
    Boudewijn Zenden, WM, 75
  `),
  pool('Monaco', 'MON', '2003/04', MONACO, '4-4-2', `
    Flavio Roma, GK, 82
    Tony Sylva, GK, 76
    Julien Rodriguez, CB, 78
    Gaël Givet, CB, 76
    Sébastien Squillaci, CB, 77
    Hugo Ibarra, FB, 79
    Patrice Evra, FB, 78
    Lucas Bernardi, DM, 80
    Akis Zikos, DM, 79
    Édouard Cissé, CM, 76
    Jaroslav Plašil, CM, 72
    Jérôme Rothen, WM, 83
    Ludovic Giuly, W, 85
    Fernando Morientes, ST, 84
    Dado Pršo, ST, 80
    Shabani Nonda, ST, 82
    Emmanuel Adebayor, ST, 70
    Hassan El Fakiri, FB, 74
    Souleymane Camara, ST, 68
  `),
  pool('Bordeaux', 'BOR', '2008/09', BORDEAUX, '4-2-3-1', `
    Ulrich Ramé, GK, 80
    Mathieu Valverde, GK, 72
    Marc Planus, CB, 77
    Souleymane Diawara, CB, 79
    Matthieu Chalmé, FB, 76
    Benoît Trémoulinas, FB, 75
    Franck Jurietti, FB, 74
    Alou Diarra, DM, 81
    Fernando Menegazzo, DM, 78
    Alejandro Alonso, CM, 72
    Yoann Gourcuff, CM, 86
    Wendel, W, 80
    Jussiê, W, 76
    Marouane Chamakh, ST, 82
    Fernando Cavenaghi, ST, 79
    David Bellion, ST, 74
    Henrique, CB, 74
    Abdou Traoré, CM, 70
    Yoan Gouffran, W/ST, 73
  `),
  pool('Auxerre', 'AJA', '2002/03', AUXERRE, '4-4-2', `
    Fabien Cool, GK, 80
    Florent Chaigneau, GK, 64
    Philippe Mexès, CB, 80
    Jean-Alain Boumsong, CB, 80
    Johan Radet, CB/FB, 74
    Jean-Sébastien Jaurès, FB, 75
    Bacary Sagna, FB, 62
    Lionel Mathis, CM, 76
    Yann Lachuer, CM, 77
    Teemu Tainio, CM, 75
    Khalilou Fadiga, WM, 81
    Olivier Kapo, W, 79
    Bonaventure Kalou, W, 76
    Djibril Cissé, ST, 85
    Benjani, ST, 72
    Kanga Akalé, W/ST, 68
    Stéphane Grichting, CB, 72
    Philippe Violeau, DM, 75
    Jean-Pascal Mignot, CB, 74
  `),
  pool('Nantes', 'NAN', '2000/01', NANTES, '4-4-2', `
    Mickaël Landreau, GK, 82
    Willy Grondin, GK, 66
    Nestor Fabbri, CB, 76
    Mario Yepes, CB, 78
    Nicolas Gillet, CB, 75
    Sylvain Armand, FB, 76
    Nicolas Savinaud, FB, 74
    Mathieu Berson, CM, 75
    Frédéric Da Rocha, CM, 77
    Eric Carrière, CM, 84
    Stéphane Ziani, CM, 78
    Salomon Olembé, WM, 76
    Olivier Monterrubio, WM, 80
    Viorel Moldovan, ST, 79
    Marama Vahirua, ST, 74
    Frédéric Mendy, ST, 70
    Nicolas Laspalles, FB, 72
    Antoine Sibierski, CM/ST, 78
    Eric Djemba-Djemba, DM, 66
  `),
]

export const POOLS: Pool[] = [
  ...of('Premier League', PREMIER_LEAGUE),
  ...of('La Liga', LA_LIGA),
  ...of('Bundesliga', BUNDESLIGA),
  ...of('Serie A', SERIE_A),
  ...of('Ligue 1', LIGUE_1),
]

/** Left-footed players here (a name already in another file's list needs no second entry). */
export const LEFT_FOOTED: string[] = [
  'Pascal Cygan', 'José Antonio Reyes', 'Edu', 'Ian Harte', 'Harry Kewell', 'Jason Wilcox', 'Dominic Matteo',
  'Wayne Bridge', 'Fábio Aurélio', 'Andrea Dossena', 'Albert Riera', 'Olivier Bernard', 'Laurent Robert',
  'Robbie Elliott', 'Gary Naysmith', 'Kevin Kilbane', 'Alessandro Pistone', 'Nicky Shorey', 'Wilfred Bouma',
  'Gareth Barry', 'Hermann Hreiðarsson', 'Sulley Muntari', 'Ricardo Gardner', 'Roberto Carlos', 'Raúl Bravo',
  'Santiago Solari', 'Guti', 'Marcelo', 'Royston Drenthe', 'Giovanni van Bronckhorst', 'Sylvinho',
  'Amedeo Carboni', 'Vicente Rodríguez', 'Albert Luque', 'Adriano Correia', 'Antonio Puerta', 'Diego Capel',
  'Ivica Dragutinović', 'Rodolfo Arruabarrena', 'Juan Pablo Sorín', 'Antonio López', 'Mariano Pernía',
  'Agustín Aranzabal', 'Javier de Pedro', 'Igor Gabilondo', 'Bixente Lizarazu', 'Michael Tarnat',
  'Marcell Jansen', 'Zé Roberto', 'Diego Placente', 'Dedê', 'Ludovic Magnin', 'Johan Micoud',
  'Christian Schulz', 'Thomas Hitzlsperger', 'Marcel Schäfer', 'Christian Pander', 'Levan Kobiashvili',
  'Kakha Kaladze', 'Serginho', 'Marek Jankulovski', 'Cristian Chivu', 'Federico Balzaretti', 'Vincent Candela',
  'Siniša Mihajlović', 'Giuseppe Favalli', 'Claudio López', 'Manuel Pasqual', 'Massimo Gobbi',
  'Jérémy Berthod', 'Florent Malouda', 'Fabio Grosso', 'Taye Taiwo', 'Karim Ziani', 'Jérôme Rothen',
  'Benoît Trémoulinas', 'Wendel', 'Khalilou Fadiga', 'Jean-Sébastien Jaurès', 'Sylvain Armand',
  'Olivier Monterrubio', 'Martin Jørgensen',
]

/** Weak feet worth noting (3 otherwise). */
export const WEAK_FOOT: Record<string, number> = {
  'Ronaldinho': 4, 'Zinedine Zidane': 5, 'Thierry Henry': 4, 'Pavel Nedvěd': 5, 'Juan Román Riquelme': 4,
  'Andriy Shevchenko': 4, 'Michael Ballack': 4, 'Deco': 4, 'Kaká': 4, 'Ronaldo Nazário': 4,
  'Roberto Carlos': 2, 'Robert Pirès': 4, 'Juninho Pernambucano': 4, 'Luís Figo': 3, 'Rui Costa': 4,
  'Laurent Robert': 2, 'Vicente Rodríguez': 2, 'Harry Kewell': 2, 'Aílton': 2,
}

/** Archetypes of the best-known players here (not already in the other files). */
export const ARCHETYPE: Record<string, Archetype> = {
  'Jens Lehmann': 'sweeperKeeper', 'Oliver Kahn': 'shotStopper', 'Dida': 'shotStopper', 'Santiago Cañizares': 'shotStopper',
  'Edwin van der Sar': 'sweeperKeeper', 'Shay Given': 'shotStopper', 'Grégory Coupet': 'shotStopper',
  'Sol Campbell': 'stopper', 'Fernando Hierro': 'ballPlayer', 'Roberto Ayala': 'stopper', 'Jamie Carragher': 'stopper',
  'Paolo Maldini': 'ballPlayer', 'Lilian Thuram': 'stopper', 'Paolo Montero': 'stopper', 'Jens Nowotny': 'ballPlayer',
  'Christian Wörns': 'stopper', 'Valérien Ismaël': 'stopper', 'Marcelo Bordon': 'stopper', 'Siniša Mihajlović': 'ballPlayer',
  'Noureddine Naybet': 'stopper', 'Samuel Kuffour': 'stopper', 'Rafael Márquez': 'ballPlayer',
  'Roberto Carlos': 'overlapping', 'Cafu': 'overlapping', 'Lauren': 'defensiveFullBack', 'Bixente Lizarazu': 'overlapping',
  'Gary Neville': 'defensiveFullBack', 'Vincent Candela': 'overlapping', 'Juan Pablo Sorín': 'overlapping',
  'Giovanni van Bronckhorst': 'overlapping', 'Dedê': 'overlapping', 
  'Patrick Vieira': 'boxToBox', 'Claude Makélélé': 'anchor', 'David Albelda': 'anchor', 'Mauro Silva': 'anchor',
  'Gilberto Silva': 'anchor', 'Owen Hargreaves': 'ballWinner', 'Edgar Davids': 'ballWinner', 'Diego Simeone': 'ballWinner',
  'Emerson': 'ballWinner', 'Jens Jeremies': 'ballWinner', 'Carsten Ramelow': 'anchor', 'Marcos Senna': 'deepPlaymaker',
  'Zinedine Zidane': 'playmaker', 'Juan Román Riquelme': 'playmaker', 'Rui Costa': 'playmaker', 'Juan Carlos Valerón': 'playmaker',
  'Pablo Aimar': 'playmaker', 'Johan Micoud': 'playmaker', 'Deco': 'playmaker', 'Juan Sebastián Verón': 'playmaker',
  'Juninho Pernambucano': 'playmaker', 'Zvjezdan Misimović': 'playmaker', 'Lincoln': 'playmaker', 'Tomáš Rosický': 'playmaker',
  'Eric Carrière': 'playmaker', 'Mehmet Scholl': 'playmaker', 'Paul Scholes': 'playmaker',
  'Frank Lampard': 'boxToBox', 'Stefan Effenberg': 'boxToBox', 'Michael Ballack': 'boxToBox', 'Michael Essien': 'boxToBox',
  'Lee Bowyer': 'boxToBox', 'Tim Cahill': 'boxToBox', 'Rubén Baraja': 'boxToBox', 
  'Robert Pirès': 'insideForward', 'Luís Figo': 'winger', 'Ronaldinho': 'insideForward', 'Pavel Nedvěd': 'insideForward',
  'Laurent Robert': 'winger', 'Nolberto Solano': 'winger', 'Harry Kewell': 'insideForward', 'Vicente Rodríguez': 'winger',
  'Jérôme Rothen': 'winger', 'Ludovic Giuly': 'insideForward', 'Damien Duff': 'winger',
  'Sidney Govou': 'winger', 'Khalilou Fadiga': 'winger', 'Fredrik Ljungberg': 'insideForward', 'Simão': 'winger',
  'Thierry Henry': 'falseNine', 'Dennis Bergkamp': 'falseNine', 
  'Ronaldo Nazário': 'poacher', 'Andriy Shevchenko': 'poacher', 'Filippo Inzaghi': 'poacher',
  'David Trezeguet': 'poacher', 'Alan Shearer': 'targetMan', 'Jan Koller': 'targetMan',
  'Luca Toni': 'targetMan', 'Carsten Jancker': 'targetMan', 'Mark Viduka': 'targetMan', 'Duncan Ferguson': 'targetMan',
  'Emile Heskey': 'targetMan', 'John Carew': 'targetMan', 'Christian Vieri': 'targetMan', 'Gabriel Batistuta': 'poacher',
  'Hernán Crespo': 'poacher', 'Giovane Élber': 'poacher', 'Aílton': 'poacher', 'Márcio Amoroso': 'poacher',
  'Diego Tristán': 'poacher', 'Mista': 'poacher', 'Nihat Kahveci': 'poacher', 'Darko Kovačević': 'targetMan',
  'Grafite': 'poacher', 'Kevin Kurányi': 'targetMan', 'Frédéric Kanouté': 'targetMan', 'Luís Fabiano': 'poacher',
  'Diego Forlán': 'poacher', 'Adrian Mutu': 'falseNine', 'Fernando Morientes': 'targetMan', 'Djibril Cissé': 'poacher', 'Mamadou Niang': 'poacher',
  'Marouane Chamakh': 'targetMan', 'Kevin Davies': 'targetMan', 'Craig Bellamy': 'poacher', 'Viorel Moldovan': 'poacher',
}
