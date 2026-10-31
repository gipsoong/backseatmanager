/** Draft mode's Serie A clubs: squads of single seasons, 2010/11 to 2024/25 (see squads.ts). */
import type { Archetype } from '../engine/index.ts'
import { kit, pool, type Pool } from './squads.ts'

const STRIPES = kit('#232527', '#f2f2ee', 'black')
const NERAZZURRI = kit('#1d3f9a', '#f0c330', 'blue')
const ROSSONERI = kit('#c8202f', '#f2f2ee', 'red')
const AZZURRI = kit('#3a8ee0', '#ffffff', 'blue')
const GIALLOROSSI = kit('#8e1f2f', '#f0b323', 'red')
const BIANCOCELESTI = kit('#8fc6ea', '#1b2a4a', 'blue')
const DEA = kit('#24489c', '#ffffff', 'blue')
const VIOLA = kit('#5b2a86', '#ffffff', 'purple')
const SAMP = kit('#1f4fa0', '#ffffff', 'blue')
const GRIFONE = kit('#9b1b30', '#1b2a4a', 'red')
const GRANATA = kit('#7a1f2b', '#ffffff', 'red')
const NEROVERDI = kit('#1a7a3c', '#232527', 'green')
const ROSSOBLU = kit('#a2132e', '#1b2a4a', 'red')
const CROCIATI = kit('#f2f2ee', '#1b2a4a', 'white')
const ROSANERO = kit('#e58fb3', '#232527', 'red')
const GIALLOBLU = kit('#f6d32b', '#1b3a8a', 'yellow')
const CASTEDDU = kit('#a51d36', '#1b2a4a', 'red')
const EMPOLI = kit('#1e5bb5', '#ffffff', 'blue')
const BRIANZA = kit('#d0202e', '#ffffff', 'red')
const LARIANI = kit('#1c3f8a', '#ffffff', 'blue')

export const POOLS: Pool[] = [
  pool('Juventus', 'JUV', '2011/12', STRIPES, '3-5-2', `
    Gianluigi Buffon, GK, 87
    Marco Storari, GK, 77
    Andrea Barzagli, CB, 82
    Leonardo Bonucci, CB, 79
    Giorgio Chiellini, CB/FB, 86
    Martín Cáceres, CB/FB, 76
    Stephan Lichtsteiner, FB/WM, 80
    Paolo De Ceglie, FB, 74
    Andrea Pirlo, DM/CM, 86
    Claudio Marchisio, CM, 83
    Arturo Vidal, CM/DM, 82
    Emanuele Giaccherini, WM/CM, 74
    Simone Pepe, WM/W, 76
    Miloš Krasić, WM/W, 79
    Marcelo Estigarribia, WM/FB, 72
    Simone Padoin, CM/WM, 72
    Alessandro Del Piero, ST/CM, 82
    Mirko Vučinić, ST/W, 82
    Alessandro Matri, ST, 78
    Fabio Quagliarella, ST, 80
  `),
  pool('Juventus', 'JUV', '2014/15', STRIPES, '3-5-2', `
    Gianluigi Buffon, GK, 88
    Marco Storari, GK, 76
    Andrea Barzagli, CB, 85
    Leonardo Bonucci, CB, 83
    Giorgio Chiellini, CB/FB, 85
    Angelo Ogbonna, CB, 77
    Martín Cáceres, CB/FB, 79
    Stephan Lichtsteiner, FB/WM, 82
    Patrice Evra, FB, 82
    Kwadwo Asamoah, FB/CM, 81
    Andrea Pirlo, DM, 86
    Claudio Marchisio, CM/DM, 84
    Arturo Vidal, CM, 86
    Paul Pogba, CM, 83
    Roberto Pereyra, CM/W, 77
    Stefano Sturaro, CM, 70
    Simone Padoin, CM/FB, 72
    Kingsley Coman, W, 70
    Carlos Tevez, ST, 85
    Fernando Llorente, ST, 82
    Álvaro Morata, ST, 78
    Alessandro Matri, ST, 76
  `),
  pool('Juventus', 'JUV', '2015/16', STRIPES, '3-5-2', `
    Gianluigi Buffon, GK, 88
    Neto, GK, 78
    Andrea Barzagli, CB, 85
    Leonardo Bonucci, CB, 85
    Giorgio Chiellini, CB, 85
    Daniele Rugani, CB, 74
    Martín Cáceres, CB/FB, 78
    Stephan Lichtsteiner, FB, 82
    Patrice Evra, FB, 82
    Alex Sandro, FB, 80, Alex Sandro
    Kwadwo Asamoah, FB/CM, 79
    Juan Cuadrado, W/WM, 82
    Sami Khedira, CM, 84
    Claudio Marchisio, DM/CM, 84
    Paul Pogba, CM, 86
    Hernanes, CM/DM, 81
    Roberto Pereyra, CM/W, 78
    Stefano Sturaro, CM, 72
    Mario Lemina, CM, 72
    Paulo Dybala, ST/CM, 81
    Mario Mandžukić, ST, 84
    Álvaro Morata, ST, 81
    Simone Zaza, ST, 77
  `),
  pool('Juventus', 'JUV', '2016/17', STRIPES, '4-2-3-1', `
    Gianluigi Buffon, GK, 88
    Neto, GK, 78
    Andrea Barzagli, CB, 85
    Leonardo Bonucci, CB, 86
    Giorgio Chiellini, CB, 86
    Medhi Benatia, CB, 82
    Daniele Rugani, CB, 76
    Dani Alves, FB, 85
    Stephan Lichtsteiner, FB, 81
    Alex Sandro, FB, 83, Alex Sandro
    Kwadwo Asamoah, FB/CM, 78
    Miralem Pjanić, CM/DM, 85
    Sami Khedira, CM, 84
    Claudio Marchisio, DM/CM, 84
    Tomás Rincón, DM, 77
    Stefano Sturaro, CM, 73
    Mario Lemina, CM, 74
    Juan Cuadrado, W, 82
    Mario Mandžukić, W/ST, 84
    Marko Pjaca, W, 77
    Paulo Dybala, CM/ST, 86
    Gonzalo Higuaín, ST, 87
  `),
  pool('Juventus', 'JUV', '2018/19', STRIPES, '4-3-3', `
    Wojciech Szczęsny, GK, 87
    Mattia Perin, GK, 82
    Giorgio Chiellini, CB, 89
    Leonardo Bonucci, CB, 86
    Medhi Benatia, CB, 84
    Daniele Rugani, CB, 79
    Andrea Barzagli, CB, 83
    João Cancelo, FB, 84
    Alex Sandro, FB, 85, Alex Sandro
    Mattia De Sciglio, FB, 80
    Leonardo Spinazzola, FB, 79
    Miralem Pjanić, DM, 87
    Sami Khedira, CM, 85
    Blaise Matuidi, CM, 84
    Emre Can, CM/DM, 82
    Rodrigo Bentancur, CM, 78
    Juan Cuadrado, W/FB, 83
    Douglas Costa, W, 86, Douglas Costa
    Federico Bernardeschi, W, 81
    Paulo Dybala, W/ST, 89
    Mario Mandžukić, ST, 85
    Cristiano Ronaldo, ST/W, 94
    Moise Kean, ST, 74
  `),
  pool('Inter', 'INT', '2010/11', NERAZZURRI, '4-4-2', `
    Júlio César, GK, 87, Júlio César
    Luca Castellazzi, GK, 72
    Lúcio, CB, 87
    Walter Samuel, CB, 85
    Marco Materazzi, CB, 79
    Andrea Ranocchia, CB, 78
    Iván Córdoba, CB, 80
    Maicon, FB, 87
    Javier Zanetti, FB/CM, 86
    Cristian Chivu, FB/CB, 81
    Yuto Nagatomo, FB, 74
    Davide Santon, FB, 73
    Esteban Cambiasso, DM/CM, 86
    Thiago Motta, DM/CM, 82
    Dejan Stanković, CM, 84
    Sulley Muntari, CM, 78
    Wesley Sneijder, CM, 89
    Goran Pandev, W/ST, 81
    Philippe Coutinho, W, 68
    Diego Milito, ST, 87
    Samuel Eto’o, ST, 88
    Giampaolo Pazzini, ST, 82
  `),
  pool('Inter', 'INT', '2019/20', NERAZZURRI, '3-5-2', `
    Samir Handanović, GK, 88
    Daniele Padelli, GK, 70
    Milan Škriniar, CB, 86
    Stefan de Vrij, CB, 85
    Diego Godín, CB, 87
    Alessandro Bastoni, CB, 75
    Danilo D’Ambrosio, CB/FB, 78
    Andrea Ranocchia, CB, 75
    Antonio Candreva, WM/FB, 80
    Victor Moses, FB/WM, 77
    Ashley Young, FB/WM, 78
    Kwadwo Asamoah, FB, 81
    Cristiano Biraghi, FB, 78
    Marcelo Brozović, DM, 84
    Nicolò Barella, CM, 82
    Stefano Sensi, CM, 77
    Roberto Gagliardini, CM, 76
    Matías Vecino, CM, 78
    Borja Valero, CM, 78
    Christian Eriksen, CM, 87
    Romelu Lukaku, ST, 85
    Lautaro Martínez, ST, 82
    Alexis Sánchez, ST/W, 82, Alexis
  `),
  pool('Inter', 'INT', '2020/21', NERAZZURRI, '3-5-2', `
    Samir Handanović, GK, 87
    Ionuț Radu, GK, 72
    Milan Škriniar, CB, 84
    Stefan de Vrij, CB, 86
    Alessandro Bastoni, CB, 81
    Danilo D’Ambrosio, CB/FB, 78
    Aleksandar Kolarov, CB/FB, 80
    Andrea Ranocchia, CB, 74
    Achraf Hakimi, FB/WM, 84
    Ivan Perišić, FB/W, 84
    Ashley Young, FB, 78
    Matteo Darmian, FB, 77
    Marcelo Brozović, DM, 85
    Nicolò Barella, CM, 84
    Christian Eriksen, CM, 85
    Arturo Vidal, CM, 84
    Roberto Gagliardini, CM, 76
    Stefano Sensi, CM, 79
    Romelu Lukaku, ST, 86
    Lautaro Martínez, ST, 85
    Alexis Sánchez, ST, 82, Alexis
    Andrea Pinamonti, ST, 72
  `),
  pool('Inter', 'INT', '2022/23', NERAZZURRI, '3-5-2', `
    André Onana, GK, 81
    Samir Handanović, GK, 85
    Milan Škriniar, CB, 86
    Stefan de Vrij, CB, 84
    Alessandro Bastoni, CB, 85
    Francesco Acerbi, CB, 81
    Danilo D’Ambrosio, CB, 77
    Denzel Dumfries, FB, 82
    Federico Dimarco, FB, 82
    Robin Gosens, FB, 80
    Matteo Darmian, FB/CB, 79
    Raoul Bellanova, FB, 70
    Marcelo Brozović, DM, 86
    Hakan Çalhanoğlu, DM/CM, 84
    Nicolò Barella, CM, 86
    Henrikh Mkhitaryan, CM, 81
    Kristjan Asllani, DM, 72
    Roberto Gagliardini, CM, 76
    Lautaro Martínez, ST, 86
    Edin Džeko, ST, 83
    Romelu Lukaku, ST, 86
    Joaquín Correa, ST, 79
  `),
  pool('Inter', 'INT', '2023/24', NERAZZURRI, '3-5-2', `
    Yann Sommer, GK, 84
    Emil Audero, GK, 76
    Benjamin Pavard, CB/FB, 84
    Francesco Acerbi, CB, 84
    Alessandro Bastoni, CB, 86
    Stefan de Vrij, CB, 83
    Yann Bisseck, CB, 74
    Matteo Darmian, FB/CB, 79
    Denzel Dumfries, FB, 82
    Federico Dimarco, FB, 84
    Carlos Augusto, FB, 76, Carlos Augusto
    Juan Cuadrado, FB/W, 78
    Hakan Çalhanoğlu, DM, 86
    Nicolò Barella, CM, 87
    Henrikh Mkhitaryan, CM, 83
    Davide Frattesi, CM, 80
    Kristjan Asllani, DM, 74
    Davy Klaassen, CM, 76
    Lautaro Martínez, ST, 89
    Marcus Thuram, ST, 82
    Marko Arnautović, ST, 77
    Alexis Sánchez, ST, 79, Alexis
  `),
  pool('AC Milan', 'MIL', '2010/11', ROSSONERI, '4-4-2', `
    Christian Abbiati, GK, 79
    Marco Amelia, GK, 76
    Thiago Silva, CB, 86, Thiago Silva
    Alessandro Nesta, CB, 87
    Mario Yepes, CB, 78
    Daniele Bonera, CB/FB, 76
    Gianluca Zambrotta, FB, 80
    Ignazio Abate, FB, 77
    Luca Antonini, FB, 75
    Andrea Pirlo, DM, 86
    Mark van Bommel, DM, 83
    Gennaro Gattuso, DM/CM, 83
    Massimo Ambrosini, DM, 79
    Clarence Seedorf, CM, 84
    Kevin-Prince Boateng, CM, 79
    Mathieu Flamini, CM/DM, 78
    Ronaldinho, CM/W, 84
    Antonio Cassano, ST/CM, 83
    Robinho, ST/W, 84
    Alexandre Pato, ST, 84, Pato
    Zlatan Ibrahimović, ST, 87
    Filippo Inzaghi, ST, 78
  `),
  pool('AC Milan', 'MIL', '2012/13', ROSSONERI, '4-3-3', `
    Christian Abbiati, GK, 78
    Marco Amelia, GK, 75
    Philippe Mexès, CB, 81
    Cristián Zapata, CB, 77
    Francesco Acerbi, CB, 72
    Daniele Bonera, CB/FB, 76
    Mattia De Sciglio, FB, 70
    Ignazio Abate, FB, 79
    Kévin Constant, FB, 73
    Luca Antonini, FB, 74
    Riccardo Montolivo, CM/DM, 81
    Nigel de Jong, DM, 82
    Massimo Ambrosini, DM, 77
    Sulley Muntari, CM, 77
    Antonio Nocerino, CM, 76
    Kevin-Prince Boateng, CM/W, 80
    Stephan El Shaarawy, W, 79
    M’Baye Niang, W/ST, 66
    Bojan Krkić, W/ST, 75, Bojan
    Robinho, W/ST, 82
    Mario Balotelli, ST, 82
    Giampaolo Pazzini, ST, 80
    Alexandre Pato, ST, 81, Pato
  `),
  pool('AC Milan', 'MIL', '2021/22', ROSSONERI, '4-2-3-1', `
    Mike Maignan, GK, 83
    Ciprian Tătărușanu, GK, 76
    Fikayo Tomori, CB, 82
    Simon Kjær, CB, 83
    Alessio Romagnoli, CB, 81
    Pierre Kalulu, CB/FB, 74
    Matteo Gabbia, CB, 70
    Davide Calabria, FB, 78
    Theo Hernández, FB, 84
    Alessandro Florenzi, FB, 79
    Fodé Ballo-Touré, FB, 74
    Sandro Tonali, CM/DM, 80
    Franck Kessié, CM, 84
    Ismaël Bennacer, DM, 81
    Rade Krunić, CM, 76
    Brahim Díaz, CM/W, 79
    Alexis Saelemaekers, W/WM, 77
    Junior Messias, W, 75
    Rafael Leão, W, 80
    Ante Rebić, W/ST, 81
    Olivier Giroud, ST, 82
    Zlatan Ibrahimović, ST, 85
  `),
  pool('AC Milan', 'MIL', '2023/24', ROSSONERI, '4-2-3-1', `
    Mike Maignan, GK, 87
    Marco Sportiello, GK, 74
    Fikayo Tomori, CB, 82
    Malick Thiaw, CB, 76
    Matteo Gabbia, CB, 74
    Pierre Kalulu, CB, 78
    Simon Kjær, CB, 77
    Davide Calabria, FB, 79
    Theo Hernández, FB, 86
    Alessandro Florenzi, FB, 76
    Ismaël Bennacer, DM, 80
    Yacine Adli, DM/CM, 74
    Yunus Musah, CM, 75
    Tijjani Reijnders, CM, 78
    Ruben Loftus-Cheek, CM, 79
    Christian Pulisic, W, 82
    Samuel Chukwueze, W, 79
    Rafael Leão, W, 86
    Noah Okafor, W/ST, 75
    Olivier Giroud, ST, 81
    Luka Jović, ST, 75
  `),
  pool('Napoli', 'NAP', '2012/13', AZZURRI, '3-4-3', `
    Morgan De Sanctis, GK, 80
    Rafael Cabral, GK, 70
    Paolo Cannavaro, CB, 78
    Hugo Campagnaro, CB, 79
    Salvatore Aronica, CB, 74
    Miguel Britos, CB, 74
    Alessandro Gamberini, CB, 76
    Federico Fernández, CB, 75
    Christian Maggio, FB/WM, 81
    Juan Camilo Zúñiga, FB/WM, 78
    Andrea Dossena, FB, 74
    Giandomenico Mesto, WM/FB, 74
    Gökhan İnler, CM, 81
    Valon Behrami, DM, 79
    Blerim Džemaili, CM, 78
    Marek Hamšík, CM, 85
    Lorenzo Insigne, W, 71
    Eduardo Vargas, W, 72
    Goran Pandev, ST/W, 80
    Edinson Cavani, ST, 86
  `),
  pool('Napoli', 'NAP', '2017/18', AZZURRI, '4-3-3', `
    Pepe Reina, GK, 85
    Rafael Cabral, GK, 70
    Kalidou Koulibaly, CB, 86
    Raúl Albiol, CB, 83
    Vlad Chiricheș, CB, 76
    Nikola Maksimović, CB, 77
    Lorenzo Tonelli, CB, 72
    Elseid Hysaj, FB, 81
    Faouzi Ghoulam, FB, 83
    Mário Rui, FB, 79
    Christian Maggio, FB, 77
    Jorginho, DM, 85
    Amadou Diawara, DM, 76
    Allan, CM, 83
    Marek Hamšík, CM, 86
    Piotr Zieliński, CM, 82
    Marko Rog, CM, 73
    José Callejón, W, 85
    Lorenzo Insigne, W, 86
    Adam Ounas, W, 72
    Dries Mertens, ST/W, 87
    Arkadiusz Milik, ST, 80
  `),
  pool('Napoli', 'NAP', '2022/23', AZZURRI, '4-3-3', `
    Alex Meret, GK, 79
    Pierluigi Gollini, GK, 76
    Kim Min-jae, CB, 82
    Amir Rrahmani, CB, 79
    Leo Østigård, CB, 73
    Juan Jesus, CB, 76, Juan Jesus
    Giovanni Di Lorenzo, FB, 84
    Mathías Olivera, FB, 76
    Mário Rui, FB, 79
    Stanislav Lobotka, DM, 83
    Diego Demme, DM, 74
    André-Frank Zambo Anguissa, CM, 81, Anguissa
    Piotr Zieliński, CM, 83
    Tanguy Ndombele, CM, 77
    Eljif Elmas, CM/W, 76
    Khvicha Kvaratskhelia, W, 86
    Hirving Lozano, W, 81
    Matteo Politano, W, 80
    Giacomo Raspadori, ST/W, 79
    Victor Osimhen, ST, 88
    Giovanni Simeone, ST, 76
  `),
  pool('Napoli', 'NAP', '2024/25', AZZURRI, '4-3-3', `
    Alex Meret, GK, 80
    Elia Caprile, GK, 72
    Amir Rrahmani, CB, 80
    Alessandro Buongiorno, CB, 82
    Juan Jesus, CB, 74, Juan Jesus
    Rafa Marín, CB, 73
    Giovanni Di Lorenzo, FB/CB, 84
    Mathías Olivera, FB, 79
    Leonardo Spinazzola, FB/WM, 76
    Pasquale Mazzocchi, FB, 72
    Stanislav Lobotka, DM, 84
    André-Frank Zambo Anguissa, CM, 81, Anguissa
    Scott McTominay, CM, 81
    Billy Gilmour, CM/DM, 77
    Philip Billing, CM, 74
    Khvicha Kvaratskhelia, W, 87
    Matteo Politano, W, 80
    David Neres, W, 79
    Cyril Ngonge, W, 74
    Giacomo Raspadori, ST/CM, 80
    Romelu Lukaku, ST, 83
    Giovanni Simeone, ST, 74
  `),
  pool('Roma', 'ROM', '2013/14', GIALLOROSSI, '4-3-3', `
    Morgan De Sanctis, GK, 81
    Bogdan Lobonț, GK, 71
    Medhi Benatia, CB, 83
    Leandro Castán, CB, 80
    Nicolás Burdisso, CB, 78
    Maicon, FB, 82
    Dodô, FB, 72
    Federico Balzaretti, FB, 78
    Vasilis Torosidis, FB, 77
    Daniele De Rossi, DM, 84
    Miralem Pjanić, CM, 83
    Kevin Strootman, CM, 83
    Radja Nainggolan, CM, 80
    Michael Bradley, CM, 77
    Rodrigo Taddei, CM/WM, 74
    Gervinho, W, 80
    Adem Ljajić, W/CM, 78
    Alessandro Florenzi, WM/W/FB, 77
    Francesco Totti, ST/CM, 84
    Mattia Destro, ST, 78
    Marco Borriello, ST, 74
  `),
  pool('Roma', 'ROM', '2016/17', GIALLOROSSI, '3-4-3', `
    Wojciech Szczęsny, GK, 83
    Alisson Becker, GK, 80, Alisson
    Kostas Manolas, CB, 84
    Federico Fazio, CB, 80
    Antonio Rüdiger, CB, 81
    Juan Jesus, CB, 77, Juan Jesus
    Thomas Vermaelen, CB, 79
    Bruno Peres, FB, 79
    Emerson Palmieri, FB, 76, Emerson
    Mário Rui, FB, 76
    Alessandro Florenzi, FB/WM, 82
    Daniele De Rossi, DM, 84
    Leandro Paredes, DM, 77
    Kevin Strootman, CM, 82
    Radja Nainggolan, CM, 86
    Gerson, CM/W, 72
    Mohamed Salah, W, 83
    Diego Perotti, W, 81
    Stephan El Shaarawy, W, 81
    Edin Džeko, ST, 84
    Francesco Totti, ST, 82
  `),
  pool('Roma', 'ROM', '2021/22', GIALLOROSSI, '3-4-3', `
    Rui Patrício, GK, 84, Rui Patrício
    Mile Svilar, GK, 70
    Gianluca Mancini, CB, 81
    Chris Smalling, CB, 82
    Roger Ibañez, CB, 79, Ibañez
    Marash Kumbulla, CB, 75
    Rick Karsdorp, FB, 77
    Matías Viña, FB, 74
    Leonardo Spinazzola, FB, 83
    Nicola Zalewski, FB/WM, 68
    Ainsley Maitland-Niles, FB/CM, 74
    Bryan Cristante, DM/CM, 79
    Jordan Veretout, CM, 82
    Lorenzo Pellegrini, CM, 83
    Henrikh Mkhitaryan, CM, 82
    Sérgio Oliveira, CM, 79
    Nicolò Zaniolo, W/CM, 80
    Stephan El Shaarawy, W, 79
    Carles Pérez, W, 74
    Tammy Abraham, ST, 82
    Eldor Shomurodov, ST, 75
    Felix Afena-Gyan, ST, 63
  `),
  pool('Lazio', 'LAZ', '2014/15', BIANCOCELESTI, '4-3-3', `
    Federico Marchetti, GK, 80
    Etrit Berisha, GK, 75
    Stefan de Vrij, CB, 80
    Santiago Gentiletti, CB, 74
    Lorik Cana, CB/DM, 75
    Dušan Basta, FB, 77
    Stefan Radu, FB/CB, 77
    Abdoulay Konko, FB, 74
    Senad Lulić, FB/WM, 78
    Lucas Biglia, DM, 82
    Marco Parolo, CM, 80
    Danilo Cataldi, CM, 68
    Ogenyi Onazi, CM, 75
    Stefano Mauri, CM, 76
    Antonio Candreva, W, 82
    Felipe Anderson, W, 78, Felipe Anderson
    Keita Baldé, W, 70, Keita
    Miroslav Klose, ST, 82
    Filip Đorđević, ST, 76
    Edson Braafheid, FB, 72
  `),
  pool('Lazio', 'LAZ', '2019/20', BIANCOCELESTI, '3-5-2', `
    Thomas Strakosha, GK, 81
    Silvio Proto, GK, 70
    Francesco Acerbi, CB, 84
    Stefan Radu, CB, 79
    Luiz Felipe, CB, 76, Luiz Felipe
    Patric, CB/FB, 73
    Denis Vavro, CB, 74
    Manuel Lazzari, FB/WM, 81
    Senad Lulić, FB/WM, 79
    Adam Marušić, FB, 78
    Jony, FB/WM, 76
    Lucas Leiva, DM, 81, Lucas
    Danilo Cataldi, DM, 74
    Sergej Milinković-Savić, CM, 86
    Luis Alberto, CM, 85
    Marco Parolo, CM, 79
    Valon Berisha, CM, 76
    Joaquín Correa, ST, 82
    Ciro Immobile, ST, 87
    Felipe Caicedo, ST, 77
  `),
  pool('Lazio', 'LAZ', '2022/23', BIANCOCELESTI, '4-3-3', `
    Ivan Provedel, GK, 79
    Luís Maximiano, GK, 74
    Alessio Romagnoli, CB, 81
    Nicolò Casale, CB, 77
    Patric, CB, 74
    Mario Gila, CB, 70
    Manuel Lazzari, FB, 80
    Elseid Hysaj, FB, 77
    Adam Marušić, FB, 79
    Danilo Cataldi, DM, 77
    Marcos Antônio, DM, 72
    Sergej Milinković-Savić, CM, 86
    Luis Alberto, CM, 84
    Matías Vecino, CM, 77
    Toma Bašić, CM, 72
    Felipe Anderson, W, 82, Felipe Anderson
    Mattia Zaccagni, W, 81
    Pedro, W, 80
    Ciro Immobile, ST, 86
    Valentín Castellanos, ST, 75, Castellanos
  `),
  pool('Atalanta', 'ATA', '2016/17', DEA, '3-4-3', `
    Etrit Berisha, GK, 76
    Marco Sportiello, GK, 74
    Andrea Masiello, CB, 75
    Mattia Caldara, CB, 72
    Rafael Tolói, CB, 76
    Alessandro Bastoni, CB, 63
    Andrea Conti, FB, 72
    Leonardo Spinazzola, FB, 72
    Hans Hateboer, FB, 68
    Boukary Dramé, FB, 70
    Remo Freuler, CM, 75
    Franck Kessié, CM, 74
    Bryan Cristante, CM, 73
    Marten de Roon, CM, 75
    Roberto Gagliardini, CM, 72
    Jasmin Kurtić, CM, 75
    Alejandro Gómez, W/CM, 82, Papu Gómez
    Andrea Petagna, ST, 72
    Mauricio Pinilla, ST, 75
    Alberto Paloschi, ST, 74
  `),
  pool('Atalanta', 'ATA', '2019/20', DEA, '3-4-3', `
    Pierluigi Gollini, GK, 79
    Marco Sportiello, GK, 74
    Berat Djimsiti, CB, 77
    Rafael Tolói, CB, 79
    José Luis Palomino, CB, 78
    Mattia Caldara, CB, 77
    Simon Kjær, CB, 78
    Hans Hateboer, FB/WM, 80
    Robin Gosens, FB/WM, 79
    Timothy Castagne, FB, 77
    Guilherme Arana, FB, 73
    Marten de Roon, CM, 80
    Remo Freuler, CM, 80
    Mario Pašalić, CM, 79
    Ruslan Malinovskyi, CM, 79
    Alejandro Gómez, CM/W, 86, Papu Gómez
    Josip Iličić, W/CM, 84
    Duván Zapata, ST, 84
    Luis Muriel, ST, 82
    Musa Barrow, ST, 70
  `),
  pool('Atalanta', 'ATA', '2023/24', DEA, '3-4-3', `
    Juan Musso, GK, 80
    Marco Carnesecchi, GK, 77
    Berat Djimsiti, CB, 79
    Isak Hien, CB, 76
    Sead Kolašinac, CB/FB, 76
    Giorgio Scalvini, CB, 79
    Rafael Tolói, CB, 76
    Davide Zappacosta, FB, 77
    Matteo Ruggeri, FB, 74
    Emil Holm, FB, 74
    Mitchel Bakker, FB, 74
    Marten de Roon, CM/DM, 80
    Éderson dos Santos, CM, 80, Éderson
    Teun Koopmeiners, CM, 84
    Mario Pašalić, CM, 80
    Aleksey Miranchuk, CM, 77
    Charles De Ketelaere, CM/ST, 80
    Ademola Lookman, W/ST, 81
    Gianluca Scamacca, ST, 80
    El Bilal Touré, ST, 74
    Luis Muriel, ST, 77
  `),
  pool('Fiorentina', 'FIO', '2013/14', VIOLA, '3-5-2', `
    Neto, GK, 76
    Antonio Rosati, GK, 71
    Gonzalo Rodríguez, CB, 80
    Stefan Savić, CB, 75
    Nenad Tomović, CB/FB, 74
    Facundo Roncaglia, CB, 74
    Marvin Compper, CB, 74
    Manuel Pasqual, FB, 76
    Juan Manuel Vargas, FB/WM, 76
    Joaquín, WM/W, 79
    Borja Valero, CM, 82
    David Pizarro, DM, 80
    Alberto Aquilani, CM, 79
    Matías Fernández, CM, 76
    Massimo Ambrosini, DM, 75
    Juan Cuadrado, W/WM, 81
    Josip Iličić, W/CM, 78
    Giuseppe Rossi, ST, 82
    Mario Gómez, ST, 85
    Alessandro Matri, ST, 76
  `),
  pool('Udinese', 'UDI', '2011/12', STRIPES, '3-5-2', `
    Samir Handanović, GK, 82
    Daniele Padelli, GK, 70
    Medhi Benatia, CB, 75
    Danilo Larangeira, CB, 76, Danilo
    Maurizio Domizzi, CB, 74
    Joel Ekstrand, CB, 70
    Mauricio Isla, FB/WM, 78
    Pablo Armero, FB/WM, 79
    Dušan Basta, FB, 73
    Giovanni Pasquale, FB, 72
    Neuton, FB, 70
    Giampiero Pinzi, CM, 75
    Kwadwo Asamoah, CM, 80
    Emmanuel Agyemang-Badu, CM, 74
    Almen Abdi, CM, 73
    Gabriel Torje, W, 73
    Maicosuel, W/CM, 74
    Diego Fabbrini, W, 68
    Antonio Di Natale, ST, 84
    Antonio Floro Flores, ST, 74
  `),
  pool('Sampdoria', 'SAM', '2018/19', SAMP, '4-4-2', `
    Emil Audero, GK, 76
    Wladimiro Falcone, GK, 63
    Joachim Andersen, CB, 74
    Omar Colley, CB, 74
    Alex Ferrari, CB, 71
    Lorenzo Tonelli, CB, 72
    Bartosz Bereszyński, FB, 76
    Jacopo Sala, FB, 72
    Nicola Murru, FB, 73
    Albin Ekdal, DM, 76
    Dennis Praet, CM, 79
    Karol Linetty, CM, 76
    Ronaldo Vieira, CM, 70
    Gastón Ramírez, CM, 77
    Jakub Jankto, CM/WM, 75
    Riccardo Saponara, CM, 75
    Fabio Quagliarella, ST, 82
    Gianluca Caprari, ST, 76
    Grégoire Defrel, ST, 76
    Manolo Gabbiadini, ST, 76
  `),
  pool('Genoa', 'GEN', '2014/15', GRIFONE, '3-4-3', `
    Mattia Perin, GK, 79
    Eugenio Lamanna, GK, 70
    Nicolás Burdisso, CB, 77
    Sebastian De Maio, CB, 72
    Armando Izzo, CB, 72
    Facundo Roncaglia, CB, 73
    Šime Vrsaljko, FB, 74
    Luca Antonini, FB, 72
    Giovanni Marchese, FB, 70
    Edenílson, WM/FB, 71
    Andrea Bertolacci, CM, 76
    Tomás Rincón, DM, 75
    Juraj Kucka, CM, 76
    Luca Rigoni, CM, 72
    Diego Perotti, W, 78
    Iago Falqué, W, 76
    M’Baye Niang, W/ST, 72
    Alessandro Matri, ST, 76
    Mauricio Pinilla, ST, 75
  `),
  pool('Torino', 'TOR', '2013/14', GRANATA, '3-5-2', `
    Daniele Padelli, GK, 74
    Jean-François Gillet, GK, 73
    Kamil Glik, CB, 77
    Cesare Bovo, CB, 74
    Nikola Maksimović, CB, 70
    Emiliano Moretti, CB/FB, 75
    Guillermo Rodríguez, CB, 72
    Matteo Darmian, FB, 76
    Danilo D’Ambrosio, FB, 74
    Giuseppe Vives, DM, 73
    Alessandro Gazzi, DM, 73
    Omar El Kaddouri, CM, 74
    Alexander Farnerud, CM, 73
    Migjen Basha, CM, 72
    Matteo Brighi, CM, 73
    Alessio Cerci, W/ST, 80
    Ciro Immobile, ST, 77
    Riccardo Meggiorini, ST, 72
    Marcelo Larrondo, ST, 70
  `),
  pool('Sassuolo', 'SAS', '2015/16', NEROVERDI, '4-3-3', `
    Andrea Consigli, GK, 79
    Gianluca Pegolo, GK, 72
    Francesco Acerbi, CB, 78
    Paolo Cannavaro, CB, 75
    Federico Peluso, CB/FB, 75
    Luca Antei, CB, 70
    Šime Vrsaljko, FB, 76
    Alessandro Longhi, FB, 70
    Marcello Gazzola, FB, 70
    Francesco Magnanelli, DM, 73
    Davide Biondini, CM, 72
    Alfred Duncan, CM, 74
    Lorenzo Pellegrini, CM, 69
    Simone Missiroli, CM, 72
    Domenico Berardi, W, 80
    Nicola Sansone, W, 78
    Matteo Politano, W, 72
    Grégoire Defrel, ST/W, 75
    Sergio Floccari, ST, 72
  `),
  pool('Bologna', 'BOL', '2023/24', ROSSOBLU, '4-2-3-1', `
    Łukasz Skorupski, GK, 79
    Federico Ravaglia, GK, 68
    Riccardo Calafiori, CB/FB, 78
    Sam Beukema, CB, 77
    Jhon Lucumí, CB, 78
    Kevin Bonifazi, CB, 72
    Stefan Posch, FB, 76
    Charalampos Lykogiannis, FB, 72
    Victor Kristiansen, FB, 72
    Lorenzo De Silvestri, FB, 73
    Remo Freuler, DM, 78
    Michel Aebischer, CM, 75
    Nikola Moro, CM, 74
    Lewis Ferguson, CM, 79
    Giovanni Fabbian, CM, 72
    Oussama El Azzouzi, CM, 70
    Alexis Saelemaekers, W, 77
    Riccardo Orsolini, W, 80
    Dan Ndoye, W, 74
    Jens Odgaard, W, 72
    Joshua Zirkzee, ST, 79
    Santiago Castro, ST, 70
  `),
  pool('Parma', 'PAR', '2013/14', CROCIATI, '4-3-3', `
    Antonio Mirante, GK, 78
    Nicola Pavarini, GK, 70
    Gabriel Paletta, CB, 77
    Alessandro Lucarelli, CB, 75
    Felipe, CB, 72
    Massimo Gobbi, FB, 74
    Cristian Molinaro, FB, 74
    Alessandro Rosi, FB, 70
    Walter Gargano, DM, 77
    Gaby Mudingayi, DM, 74
    Marco Parolo, CM, 78
    Jaime Valdés, CM, 75
    José Mauri, CM, 63
    Marco Marchionni, WM, 73
    Jonathan Biabiany, W, 76
    Nicola Sansone, W, 72
    Antonio Cassano, ST/CM, 79
    Amauri, ST, 76
    Raffaele Palladino, ST, 72
  `),
  pool('Palermo', 'PAL', '2010/11', ROSANERO, '4-4-2', `
    Salvatore Sirigu, GK, 75
    Francesco Benussi, GK, 72
    Cesare Bovo, CB, 76
    Ezequiel Muñoz, CB, 72
    Dorin Goian, CB, 74
    Matías Silvestre, CB, 74
    Federico Balzaretti, FB, 78
    Mattia Cassani, FB, 76
    Matteo Darmian, FB, 66
    Giulio Migliaccio, DM, 74
    Fabio Liverani, CM, 74
    Antonio Nocerino, CM, 76
    Armin Bačinović, CM, 72
    Javier Pastore, CM, 79
    Josip Iličić, W/CM, 72
    Fabrizio Miccoli, ST, 82
    Abel Hernández, ST, 72
    Mauricio Pinilla, ST, 74
    Igor Budan, ST, 70
  `),
  pool('Hellas Verona', 'VER', '2019/20', GIALLOBLU, '3-4-3', `
    Marco Silvestri, GK, 76
    Boris Radunović, GK, 66
    Marash Kumbulla, CB, 72
    Amir Rrahmani, CB, 74
    Koray Günter, CB, 72
    Paweł Dawidowicz, CB, 72
    Davide Faraoni, FB/WM, 74
    Darko Lazović, FB/WM, 75
    Federico Dimarco, FB, 72
    Sofyan Amrabat, DM, 76
    Miguel Veloso, DM/CM, 75
    Valerio Verre, CM, 72
    Matteo Pessina, CM, 73
    Mattia Zaccagni, W/CM, 74
    Fabio Borini, W/ST, 72
    Samuel Di Carmine, ST, 72
    Giampaolo Pazzini, ST, 72
    Mariusz Stępiński, ST, 71
    Eddie Salcedo, ST, 68
  `),
  pool('Cagliari', 'CAG', '2019/20', CASTEDDU, '4-4-2', `
    Alessio Cragno, GK, 80
    Robin Olsen, GK, 78
    Fabio Pisacane, CB, 74
    Ragnar Klavan, CB, 74
    Luca Ceppitelli, CB, 73
    Sebastian Walukiewicz, CB, 68
    Charalampos Lykogiannis, FB, 70
    Luca Pellegrini, FB, 70
    Paolo Faragò, FB, 72
    Luca Cigarini, DM, 74
    Nahitan Nández, CM, 79
    Radja Nainggolan, CM, 82
    Marko Rog, CM, 75
    Artur Ioniță, CM, 72
    Valter Birsa, CM, 73
    Gastón Pereiro, CM, 72
    João Pedro Galvão, ST/CM, 76, João Pedro
    Giovanni Simeone, ST, 77
    Leonardo Pavoletti, ST, 76
  `),
  pool('Empoli', 'EMP', '2014/15', EMPOLI, '4-4-2', `
    Luigi Sepe, GK, 72
    Alberto Pelagotti, GK, 64
    Daniele Rugani, CB, 70
    Lorenzo Tonelli, CB, 72
    Federico Barba, CB, 68
    Elseid Hysaj, FB, 72
    Mário Rui, FB, 72
    Vincent Laurini, FB, 70
    Mirko Valdifiori, DM, 74
    Matías Vecino, CM, 72
    Riccardo Saponara, CM, 74
    Piotr Zieliński, CM, 70
    Daniele Croce, CM, 71
    Davide Moro, CM, 69
    Simone Verdi, W, 70
    Massimo Maccarone, ST, 75
    Francesco Tavano, ST, 72
    Levan Mchedlidze, ST, 70
    Manuel Pucciarelli, ST/W, 68
  `),
  pool('Monza', 'MON', '2022/23', BRIANZA, '3-4-3', `
    Michele Di Gregorio, GK, 76
    Alessio Cragno, GK, 78
    Pablo Marí, CB, 77
    Luca Caldirola, CB, 72
    Armando Izzo, CB, 74
    Marlon, CB, 72
    Andrea Ranocchia, CB, 74
    Carlos Augusto, FB, 74, Carlos Augusto
    Pedro Pereira, FB, 70
    Patrick Ciurria, FB/WM, 72
    Samuele Birindelli, FB, 70
    Matteo Pessina, CM, 77
    Stefano Sensi, CM, 76
    Andrea Colpani, CM, 74
    Nicolò Rovella, CM/DM, 73
    José Machín, CM, 72
    Mattia Valoti, CM, 70
    Valentín Carboni, CM, 65
    Gianluca Caprari, W/ST, 76
    Dany Mota, ST, 74
    Andrea Petagna, ST, 74
    Christian Gytkjær, ST, 70
  `),
  pool('Como', 'COM', '2024/25', LARIANI, '4-2-3-1', `
    Pepe Reina, GK, 75
    Emil Audero, GK, 75
    Marc-Oliver Kempf, CB, 74
    Edoardo Goldaniga, CB, 72
    Alberto Dossena, CB, 74
    Jacobo Ramón, CB, 70
    Alberto Moreno, FB, 75
    Ignace Van der Brempt, FB, 70
    Ivan Smolčić, FB, 70
    Alex Valle, FB, 72
    Máximo Perrone, DM/CM, 76
    Yannik Engelhardt, DM, 72
    Sergi Roberto, CM, 76
    Maxence Caqueret, CM, 77
    Lucas Da Cunha, CM, 74
    Nico Paz, CM, 76
    Gabriel Strefezza, W, 74
    Assane Diao, W, 74
    Alieu Fadera, W, 70
    Patrick Cutrone, ST, 74
    Andrea Belotti, ST, 74
  `),
].map((p) => ({ ...p, league: 'Serie A' as const }))

/** Left-footed players in these squads (not already in pools.ts). */
export const LEFT_FOOTED: string[] = [
  'Giorgio Chiellini', 'Paolo De Ceglie', 'Marcelo Estigarribia', 'Kwadwo Asamoah', 'Alex Sandro',
  'Paulo Dybala', 'Simone Zaza', 'Douglas Costa', 'Federico Bernardeschi', 'Blaise Matuidi',
  'Marco Materazzi', 'Cristian Chivu', 'Sulley Muntari', 'Alessandro Bastoni', 'Cristiano Biraghi',
  'Federico Dimarco', 'Robin Gosens', 'Francesco Acerbi', 'Carlos Augusto', 'Luca Antonini',
  'Kévin Constant', 'Theo Hernández', 'Fodé Ballo-Touré', 'Alessio Romagnoli', 'Junior Messias',
  'Ismaël Bennacer', 'Samuel Chukwueze', 'Yacine Adli', 'Andrea Dossena', 'Salvatore Aronica',
  'Miguel Britos', 'Faouzi Ghoulam', 'Mário Rui', 'Kalidou Koulibaly', 'Arkadiusz Milik',
  'Adam Ounas', 'Mathías Olivera', 'Juan Jesus', 'Matteo Politano', 'Alessandro Buongiorno',
  'David Neres', 'Cyril Ngonge', 'Federico Balzaretti', 'Leandro Castán', 'Dodô', 'Kevin Strootman',
  'Thomas Vermaelen', 'Gerson', 'Matías Viña', 'Carles Pérez', 'Nicolò Zaniolo', 'Stefan Radu',
  'Senad Lulić', 'Edson Braafheid', 'Jony', 'Andrea Petagna', 'Boukary Dramé', 'José Luis Palomino',
  'Ruslan Malinovskyi', 'Josip Iličić', 'Guilherme Arana', 'Sead Kolašinac', 'Matteo Ruggeri',
  'Mitchel Bakker', 'Teun Koopmeiners', 'Aleksey Miranchuk', 'Charles De Ketelaere',
  'Manuel Pasqual', 'Juan Manuel Vargas', 'Giuseppe Rossi', 'Pablo Armero', 'Neuton',
  'Giovanni Pasquale', 'Nicola Murru', 'Omar Colley', 'Jakub Jankto', 'Gastón Ramírez',
  'Manolo Gabbiadini', 'Iago Falqué', 'Giovanni Marchese', 'Emiliano Moretti', 'Alessio Cerci',
  'Federico Peluso', 'Domenico Berardi', 'Charalampos Lykogiannis', 'Victor Kristiansen',
  'Riccardo Orsolini', 'Jhon Lucumí', 'Massimo Gobbi', 'Cristian Molinaro', 'Miguel Veloso',
  'Luca Pellegrini', 'Valter Birsa', 'Gastón Pereiro', 'Ragnar Klavan', 'Federico Barba',
  'Pablo Marí', 'Luca Caldirola', 'Andrea Colpani', 'Valentín Carboni', 'Alex Valle', 'Nico Paz',
  'Marc-Oliver Kempf',
]

/** Weak foot where it isn't 3 stars (not already in pools.ts). */
export const WEAK_FOOT: Record<string, number> = {
  'Wesley Sneijder': 5, 'Clarence Seedorf': 4, 'Ronaldinho': 4, 'Robinho': 4,
  'Alessandro Del Piero': 4, 'Andrea Pirlo': 4, 'Henrikh Mkhitaryan': 4, 'Arturo Vidal': 4,
  'Lautaro Martínez': 4, 'Sergej Milinković-Savić': 4, 'Javier Pastore': 4, 'Josip Iličić': 4,
  'Gonzalo Higuaín': 4, 'Kevin-Prince Boateng': 4, 'Dries Mertens': 4, 'Marek Hamšík': 4,
  'Khvicha Kvaratskhelia': 4, 'Piotr Zieliński': 4, 'Douglas Costa': 2, 'Domenico Berardi': 2,
}

/** Archetypes of the best-known players (not already in pools.ts). */
export const ARCHETYPE: Record<string, Archetype> = {
  'Gianluigi Buffon': 'shotStopper', 'Samir Handanović': 'shotStopper', 'Júlio César': 'shotStopper',
  'Mike Maignan': 'sweeperKeeper', 'Yann Sommer': 'sweeperKeeper', 'Alex Meret': 'shotStopper',
  'Pepe Reina': 'sweeperKeeper', 'Mattia Perin': 'shotStopper', 'Morgan De Sanctis': 'shotStopper',
  'Christian Abbiati': 'shotStopper', 'Wojciech Szczęsny': 'shotStopper',
  'Giorgio Chiellini': 'stopper', 'Leonardo Bonucci': 'ballPlayer', 'Andrea Barzagli': 'stopper',
  'Alessandro Nesta': 'ballPlayer', 'Lúcio': 'stopper', 'Walter Samuel': 'stopper',
  'Kalidou Koulibaly': 'stopper', 'Kostas Manolas': 'stopper', 'Milan Škriniar': 'stopper',
  'Stefan de Vrij': 'ballPlayer', 'Alessandro Bastoni': 'ballPlayer', 'Francesco Acerbi': 'stopper',
  'Diego Godín': 'stopper', 'Kim Min-jae': 'stopper', 'Fikayo Tomori': 'stopper',
  'Medhi Benatia': 'stopper', 'Raúl Albiol': 'ballPlayer', 'Alessandro Buongiorno': 'stopper',
  'Kamil Glik': 'stopper', 'Benjamin Pavard': 'ballPlayer', 'Simon Kjær': 'stopper',
  'Alessio Romagnoli': 'ballPlayer', 'Gonzalo Rodríguez': 'ballPlayer', 'Philippe Mexès': 'stopper',
  'Maicon': 'overlapping', 'Javier Zanetti': 'overlapping', 'Stephan Lichtsteiner': 'overlapping',
  'Alex Sandro': 'overlapping', 'Dani Alves': 'overlapping', 'Theo Hernández': 'overlapping',
  'Achraf Hakimi': 'overlapping', 'Federico Dimarco': 'overlapping', 'Denzel Dumfries': 'overlapping',
  'Giovanni Di Lorenzo': 'overlapping', 'Faouzi Ghoulam': 'overlapping',
  'Elseid Hysaj': 'defensiveFullBack', 'Robin Gosens': 'overlapping', 'Hans Hateboer': 'overlapping',
  'Leonardo Spinazzola': 'overlapping', 'Davide Calabria': 'inverted', 'Manuel Lazzari': 'overlapping',
  'Senad Lulić': 'defensiveFullBack', 'Juan Camilo Zúñiga': 'overlapping',
  'Christian Maggio': 'overlapping', 'Pablo Armero': 'overlapping', 'Mauricio Isla': 'overlapping',
  'Cristian Chivu': 'defensiveFullBack', 'Gianluca Zambrotta': 'overlapping', 'Mário Rui': 'overlapping',
  'Andrea Pirlo': 'deepPlaymaker', 'Marcelo Brozović': 'deepPlaymaker',
  'Stanislav Lobotka': 'deepPlaymaker', 'Hakan Çalhanoğlu': 'deepPlaymaker',
  'Daniele De Rossi': 'anchor', 'Lucas Biglia': 'deepPlaymaker', 'Esteban Cambiasso': 'anchor',
  'Mark van Bommel': 'ballWinner', 'Gennaro Gattuso': 'ballWinner', 'Nigel de Jong': 'ballWinner',
  'Ismaël Bennacer': 'deepPlaymaker', 'Valon Behrami': 'ballWinner', 'David Pizarro': 'deepPlaymaker',
  'Leandro Paredes': 'deepPlaymaker', 'Tomás Rincón': 'ballWinner',
  'Claudio Marchisio': 'boxToBox', 'Arturo Vidal': 'boxToBox', 'Sami Khedira': 'boxToBox',
  'Blaise Matuidi': 'ballWinner', 'Miralem Pjanić': 'playmaker', 'Wesley Sneijder': 'playmaker',
  'Dejan Stanković': 'boxToBox', 'Clarence Seedorf': 'playmaker', 'Kevin-Prince Boateng': 'boxToBox',
  'Riccardo Montolivo': 'playmaker', 'Franck Kessié': 'boxToBox', 'Nicolò Barella': 'boxToBox',
  'Henrikh Mkhitaryan': 'playmaker', 'Marek Hamšík': 'playmaker', 'Piotr Zieliński': 'playmaker',
  'André-Frank Zambo Anguissa': 'boxToBox', 'Radja Nainggolan': 'boxToBox',
  'Kevin Strootman': 'boxToBox', 'Lorenzo Pellegrini': 'playmaker',
  'Sergej Milinković-Savić': 'boxToBox', 'Luis Alberto': 'playmaker', 'Teun Koopmeiners': 'boxToBox',
  'Marten de Roon': 'ballWinner', 'Borja Valero': 'playmaker', 'Javier Pastore': 'playmaker',
  'Tijjani Reijnders': 'boxToBox', 'Lewis Ferguson': 'boxToBox', 'Davide Frattesi': 'boxToBox',
  'Nahitan Nández': 'ballWinner', 'Marco Parolo': 'boxToBox', 'Nico Paz': 'playmaker',
  'Ruslan Malinovskyi': 'playmaker', 'Mario Pašalić': 'boxToBox', 'Éderson dos Santos': 'boxToBox',
  'Alberto Aquilani': 'playmaker', 'Remo Freuler': 'boxToBox', 'Charles De Ketelaere': 'playmaker',
  'Douglas Costa': 'winger', 'Rafael Leão': 'winger', 'Khvicha Kvaratskhelia': 'insideForward',
  'Lorenzo Insigne': 'insideForward', 'José Callejón': 'winger', 'Hirving Lozano': 'winger',
  'Matteo Politano': 'insideForward', 'Stephan El Shaarawy': 'insideForward', 'Gervinho': 'winger',
  'Felipe Anderson': 'winger', 'Antonio Candreva': 'winger', 'Domenico Berardi': 'insideForward',
  'Riccardo Orsolini': 'insideForward', 'Alessio Cerci': 'insideForward',
  'Federico Bernardeschi': 'insideForward', 'Diego Perotti': 'winger',
  'Ademola Lookman': 'insideForward', 'Josip Iličić': 'insideForward',
  'Samuel Chukwueze': 'insideForward', 'Mattia Zaccagni': 'insideForward',
  'Junior Messias': 'insideForward', 'Ante Rebić': 'winger', 'Dan Ndoye': 'winger',
  'Miloš Krasić': 'winger', 'Simone Pepe': 'winger', 'Alejandro Gómez': 'insideForward',
  'Paulo Dybala': 'falseNine', 'Antonio Di Natale': 'poacher', 'Gonzalo Higuaín': 'poacher',
  'Ciro Immobile': 'poacher', 'Diego Milito': 'poacher', 'Samuel Eto’o': 'poacher',
  'Lautaro Martínez': 'poacher', 'Victor Osimhen': 'poacher', 'Duván Zapata': 'targetMan',
  'Luis Muriel': 'poacher', 'Mario Mandžukić': 'targetMan', 'Fabio Quagliarella': 'poacher',
  'Alessandro Matri': 'poacher', 'Alessandro Del Piero': 'falseNine', 'Francesco Totti': 'falseNine',
  'Dries Mertens': 'falseNine', 'Fernando Llorente': 'targetMan', 'Álvaro Morata': 'poacher',
  'Miroslav Klose': 'poacher', 'Alexandre Pato': 'poacher', 'Robinho': 'falseNine',
  'Mario Gómez': 'targetMan', 'Giuseppe Rossi': 'poacher', 'Marcus Thuram': 'targetMan',
  'Joshua Zirkzee': 'falseNine', 'Giampaolo Pazzini': 'poacher', 'Fabrizio Miccoli': 'falseNine',
  'Antonio Cassano': 'falseNine', 'Arkadiusz Milik': 'poacher', 'Giacomo Raspadori': 'falseNine',
  'Mauricio Pinilla': 'targetMan', 'Leonardo Pavoletti': 'targetMan', 'Giovanni Simeone': 'poacher',
  'Andrea Petagna': 'targetMan', 'Marko Arnautović': 'targetMan', 'Joaquín Correa': 'falseNine',
  'Massimo Maccarone': 'poacher', 'Andrea Belotti': 'poacher',
}
