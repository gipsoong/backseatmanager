/**
 * Serie A 2024/25 for a real career: the twenty clubs and their first-team squads at the end of the
 * summer window (1 September 2024; loans at the club they went to). One player a line:
 * `Name, POS[/POS…], overall, born, foot[, known as]`, spelled as in the draft's squads files;
 * overalls are our estimate of his EA FC 25 rating. See premier-league-2024.ts.
 */
import type { RealClub } from '../real.ts'
import { kit } from '../../draft/squads.ts'

export const SEASON = 2024

export const CLUBS: RealClub[] = [
  {
    club: 'Inter', shortName: 'INT', kit: kit('#1d3f9a', '#f0c330', 'blue'), formation: '3-5-2', block: 'mid', players: `
    Yann Sommer, GK, 86, 1988, R
    Josep Martínez, GK, 76, 1998, R
    Raffaele Di Gennaro, GK, 62, 1993, R
    Alessandro Bastoni, CB, 86, 1999, L
    Francesco Acerbi, CB, 82, 1988, L
    Stefan de Vrij, CB, 82, 1992, R
    Benjamin Pavard, CB/FB, 83, 1996, R
    Yann Bisseck, CB, 77, 2000, R
    Matteo Darmian, FB/CB, 79, 1989, R
    Federico Dimarco, FB/WM, 85, 1997, L
    Denzel Dumfries, FB/WM, 82, 1996, R
    Carlos Augusto, FB, 78, 1999, L
    Tajon Buchanan, FB/W, 74, 1999, R
    Hakan Çalhanoğlu, DM/CM, 86, 1994, R
    Nicolò Barella, CM, 87, 1997, R
    Henrikh Mkhitaryan, CM, 83, 1989, R
    Davide Frattesi, CM, 81, 1999, R
    Piotr Zieliński, CM, 81, 1994, R
    Kristjan Asllani, DM, 75, 2002, R
    Lautaro Martínez, ST, 89, 1997, R
    Marcus Thuram, ST/W, 84, 1997, R
    Marko Arnautović, ST, 77, 1989, R
    Mehdi Taremi, ST, 80, 1992, R
    Joaquín Correa, ST/W, 76, 1994, R
  ` },
  {
    club: 'AC Milan', shortName: 'MIL', kit: kit('#c8202f', '#f2f2ee', 'red'), formation: '4-2-3-1', block: 'mid', players: `
    Mike Maignan, GK, 87, 1995, R
    Marco Sportiello, GK, 74, 1992, R
    Lorenzo Torriani, GK, 64, 2005, R
    Fikayo Tomori, CB, 82, 1997, R
    Malick Thiaw, CB, 80, 2001, R
    Matteo Gabbia, CB, 78, 1999, R
    Strahinja Pavlović, CB, 78, 2001, L
    Davide Calabria, FB, 79, 1996, R
    Emerson Royal, FB, 77, 1999, R, Emerson Royal
    Theo Hernández, FB, 86, 1997, L
    Filippo Terracciano, FB/CM, 72, 2003, L
    Álex Jiménez, FB, 70, 2005, R
    Youssouf Fofana, DM/CM, 81, 1999, R
    Tijjani Reijnders, CM, 83, 1998, R
    Ruben Loftus-Cheek, CM, 79, 1996, R
    Yunus Musah, CM, 76, 2002, R
    Ismaël Bennacer, CM/DM, 80, 1997, L
    Christian Pulisic, W/CM, 82, 1998, R
    Rafael Leão, W, 86, 1999, R
    Samuel Chukwueze, W, 77, 1999, L
    Noah Okafor, W/ST, 76, 2000, R
    Álvaro Morata, ST, 82, 1992, R
    Tammy Abraham, ST, 77, 1997, R
    Luka Jović, ST, 74, 1997, R
    Francesco Camarda, ST, 66, 2008, R
  ` },
  {
    club: 'Napoli', shortName: 'NAP', kit: kit('#3a8ee0', '#ffffff', 'blue'), formation: '4-3-3', block: 'mid', players: `
    Alex Meret, GK, 80, 1997, L
    Elia Caprile, GK, 72, 2001, R
    Nikita Contini, GK, 62, 1996, R
    Amir Rrahmani, CB, 80, 1994, R
    Alessandro Buongiorno, CB, 82, 1999, L
    Juan Jesus, CB, 74, 1991, L, Juan Jesus
    Rafa Marín, CB, 73, 2002, R
    Giovanni Di Lorenzo, FB/CB, 84, 1993, R
    Mathías Olivera, FB, 79, 1997, L
    Leonardo Spinazzola, FB/WM, 76, 1993, R
    Pasquale Mazzocchi, FB, 72, 1995, R
    Stanislav Lobotka, DM, 84, 1994, R
    André-Frank Zambo Anguissa, CM, 81, 1995, R, Anguissa
    Scott McTominay, CM, 81, 1996, R
    Billy Gilmour, CM/DM, 77, 2001, R
    Khvicha Kvaratskhelia, W, 87, 2001, R
    Matteo Politano, W, 80, 1993, L
    David Neres, W, 79, 1997, L
    Cyril Ngonge, W, 74, 2000, L
    Giacomo Raspadori, ST/CM, 80, 2000, R
    Romelu Lukaku, ST, 83, 1993, L
    Giovanni Simeone, ST, 74, 1995, R
  ` },
  {
    club: 'Atalanta', shortName: 'ATA', kit: kit('#24489c', '#ffffff', 'blue'), formation: '3-4-3', block: 'high', players: `
    Marco Carnesecchi, GK, 80, 2000, R
    Rui Patrício, GK, 77, 1988, L
    Francesco Rossi, GK, 62, 1991, R
    Berat Djimsiti, CB, 79, 1993, R
    Isak Hien, CB, 78, 1999, R
    Sead Kolašinac, CB, 77, 1993, L
    Odilon Kossounou, CB, 78, 2001, R
    Rafael Tolói, CB, 75, 1990, R
    Giorgio Scalvini, CB, 79, 2003, R
    Ben Godfrey, CB, 73, 1998, R
    Raoul Bellanova, FB/WM, 77, 2000, R
    Davide Zappacosta, FB/WM, 77, 1992, R
    Matteo Ruggeri, FB/WM, 76, 2002, L
    Juan Cuadrado, FB/W, 75, 1988, R
    Éderson, CM/DM, 82, 1999, R, Éderson
    Marten de Roon, DM/CM, 80, 1991, R
    Mario Pašalić, CM, 78, 1995, R
    Marco Brescianini, CM, 74, 2000, R
    Lazar Samardžić, CM/W, 77, 2002, L
    Ademola Lookman, W/ST, 84, 1997, R
    Charles De Ketelaere, CM/ST, 82, 2001, L
    Nicolò Zaniolo, W/CM, 76, 1999, L
    Mateo Retegui, ST, 80, 1999, R
    Gianluca Scamacca, ST, 80, 1999, R
  ` },
  {
    club: 'Juventus', shortName: 'JUV', kit: kit('#232527', '#f2f2ee', 'black'), formation: '4-2-3-1', block: 'mid', players: `
    Michele Di Gregorio, GK, 82, 1997, R
    Mattia Perin, GK, 78, 1992, R
    Carlo Pinsoglio, GK, 62, 1990, R
    Gleison Bremer, CB, 86, 1997, R, Bremer
    Federico Gatti, CB, 80, 1998, R
    Danilo Luiz da Silva, CB/FB, 79, 1991, R, Danilo
    Pierre Kalulu, CB/FB, 78, 2000, R
    Nicolò Savona, FB/CB, 68, 2003, R
    Andrea Cambiaso, FB/WM, 81, 2000, R
    Juan Cabal, FB/CB, 74, 2001, L
    Manuel Locatelli, DM/CM, 82, 1998, R
    Douglas Luiz, CM/DM, 82, 1998, R, Douglas Luiz
    Khéphren Thuram, CM, 80, 2001, R
    Teun Koopmeiners, CM, 82, 1998, L
    Weston McKennie, CM/FB, 78, 1998, R
    Nicolò Fagioli, CM, 76, 2001, R
    Francisco Conceição, W, 78, 2002, L
    Kenan Yıldız, W/CM, 77, 2005, R
    Timothy Weah, W/FB, 76, 2000, R
    Samuel Mbangula, W, 70, 2004, R
    Nicolás González, W, 81, 1998, L
    Dušan Vlahović, ST, 84, 2000, L
    Arkadiusz Milik, ST, 76, 1994, L
  ` },
  {
    club: 'Roma', shortName: 'ROM', kit: kit('#8e1f2f', '#f0b323', 'red'), formation: '3-4-3', block: 'mid', players: `
    Mile Svilar, GK, 80, 1999, R
    Mathew Ryan, GK, 74, 1992, R
    Renato Marin, GK, 64, 2006, R
    Evan Ndicka, CB, 80, 1999, L
    Gianluca Mancini, CB, 81, 1996, R
    Mats Hummels, CB, 82, 1988, R
    Mario Hermoso, CB, 79, 1995, L
    Zeki Çelik, FB/CB, 76, 1997, R
    Angeliño, FB/WM, 80, 1997, L
    Alexis Saelemaekers, FB/W, 76, 1999, R
    Samuel Dahl, FB, 70, 2003, L
    Saud Abdulhamid, FB, 70, 1999, R
    Bryan Cristante, DM/CM, 79, 1995, R
    Manu Koné, CM, 79, 2001, R
    Enzo Le Fée, CM, 75, 2000, L
    Leandro Paredes, DM, 79, 1994, R
    Niccolò Pisilli, CM, 70, 2004, R
    Lorenzo Pellegrini, CM, 81, 1996, R
    Paulo Dybala, CM/ST, 85, 1993, L
    Matías Soulé, W, 77, 2003, L
    Stephan El Shaarawy, W, 77, 1992, R
    Tommaso Baldanzi, CM/W, 74, 2003, L
    Nicola Zalewski, WM/W, 74, 2002, R
    Artem Dovbyk, ST, 82, 1997, R
    Eldor Shomurodov, ST, 74, 1995, R
  ` },
  {
    club: 'Lazio', shortName: 'LAZ', kit: kit('#8fc6ea', '#1b2a4a', 'blue'), formation: '4-2-3-1', block: 'high', players: `
    Ivan Provedel, GK, 81, 1994, R
    Christos Mandas, GK, 74, 2001, R
    Alessio Romagnoli, CB, 80, 1995, L
    Mario Gila, CB, 77, 2000, R
    Patric, CB, 75, 1993, R
    Samuel Gigot, CB, 74, 1993, R
    Adam Marušić, FB, 78, 1992, R
    Manuel Lazzari, FB/WM, 76, 1993, R
    Nuno Tavares, FB, 75, 2000, L
    Luca Pellegrini, FB, 74, 1999, L
    Elseid Hysaj, FB, 73, 1994, R
    Nicolò Rovella, DM, 78, 2001, R
    Matteo Guendouzi, CM, 79, 1999, L
    Matías Vecino, CM, 76, 1991, R
    Fisayo Dele-Bashiru, CM, 72, 2001, R
    Gustav Isaksen, W, 76, 2001, L
    Mattia Zaccagni, W, 81, 1995, R
    Pedro, W/ST, 77, 1987, R
    Loum Tchaouna, W, 74, 2003, L
    Tijjani Noslin, W/ST, 74, 1999, R
    Boulaye Dia, ST/W, 77, 1996, R
    Valentín Castellanos, ST, 78, 1998, R
    Matteo Cancellieri, W, 72, 2002, L
  ` },
  {
    club: 'Fiorentina', shortName: 'FIO', kit: kit('#5b2a86', '#ffffff', 'purple'), formation: '3-4-3', block: 'low', players: `
    David de Gea, GK, 82, 1990, R
    Pietro Terracciano, GK, 74, 1990, R
    Tommaso Martinelli, GK, 62, 2006, R
    Luca Ranieri, CB, 75, 1999, L
    Pietro Comuzzo, CB, 72, 2005, R
    Lucas Martínez Quarta, CB, 77, 1996, R
    Marin Pongračić, CB, 75, 1997, R
    Matías Moreno, CB, 70, 2003, L
    Domilson Cordeiro dos Santos, FB, 79, 1998, R, Dodô
    Michael Kayode, FB, 74, 2004, R
    Robin Gosens, FB/WM, 78, 1994, L
    Cristiano Biraghi, FB, 75, 1992, L
    Fabiano Parisi, FB, 72, 2000, L
    Rolando Mandragora, CM/DM, 77, 1997, L
    Edoardo Bove, CM, 74, 2002, R
    Amir Richardson, CM, 72, 2002, R
    Danilo Cataldi, DM, 75, 1994, R
    Yacine Adli, CM, 74, 2000, L
    Andrea Colpani, CM/W, 76, 1999, L
    Lucas Beltrán, ST/CM, 75, 2001, R
    Riccardo Sottil, W, 72, 1999, L
    Jonathan Ikoné, W, 75, 1998, R
    Christian Kouamé, W/ST, 73, 1997, R
    Moise Kean, ST, 77, 2000, R
    Albert Guðmundsson, ST/W, 79, 1997, R
  ` },
  {
    club: 'Bologna', shortName: 'BOL', kit: kit('#9b1b30', '#1b2a4a', 'red'), formation: '4-2-3-1', block: 'high', players: `
    Łukasz Skorupski, GK, 79, 1991, R
    Federico Ravaglia, GK, 70, 1999, R
    Jhon Lucumí, CB, 79, 1998, L
    Sam Beukema, CB, 78, 1998, R
    Nicolò Casale, CB, 75, 1998, R
    Martin Erlić, CB, 74, 1998, R
    Lorenzo De Silvestri, FB, 73, 1988, R
    Stefan Posch, FB, 76, 1997, R
    Emil Holm, FB, 74, 2000, R
    Juan Miranda, FB, 75, 2000, L
    Charalampos Lykogiannis, FB, 72, 1993, L
    Remo Freuler, DM, 80, 1992, R
    Nikola Moro, CM, 74, 1998, R
    Michel Aebischer, CM, 75, 1997, L
    Giovanni Fabbian, CM, 74, 2003, R
    Tommaso Pobega, CM, 74, 1999, R
    Oussama El Azzouzi, CM, 70, 2001, R
    Lewis Ferguson, CM, 79, 1999, R
    Riccardo Orsolini, W, 79, 1997, L
    Dan Ndoye, W, 77, 2000, R
    Jesper Karlsson, W, 75, 1998, R
    Samuel Iling-Junior, W/FB, 72, 2003, L
    Santiago Castro, ST, 73, 2004, R
    Thijs Dallinga, ST, 74, 2000, R
    Jens Odgaard, CM/ST, 73, 1999, R
  ` },
  {
    club: 'Como', shortName: 'COM', kit: kit('#1c4fa1', '#ffffff', 'blue'), formation: '4-2-3-1', block: 'mid', players: `
    Pepe Reina, GK, 75, 1982, R
    Emil Audero, GK, 75, 1997, R
    Marc-Oliver Kempf, CB, 74, 1995, L
    Edoardo Goldaniga, CB, 72, 1993, R
    Alberto Dossena, CB, 74, 1998, R
    Fellipe Jack, CB, 66, 2005, R
    Alberto Moreno, FB, 75, 1992, L
    Ignace Van der Brempt, FB, 70, 2002, R
    Marco Sala, FB, 68, 1999, L
    Alessio Iovine, FB/CM, 69, 2000, R
    Máximo Perrone, DM/CM, 76, 2003, R
    Yannik Engelhardt, DM, 72, 2001, R
    Sergi Roberto, CM, 76, 1992, R
    Daniele Baselli, CM, 70, 1992, R
    Lucas Da Cunha, CM, 74, 2001, R
    Matthias Braunöder, CM, 70, 2002, R
    Nico Paz, CM, 76, 2004, L
    Gabriel Strefezza, W, 74, 1997, R
    Alieu Fadera, W, 70, 2001, R
    Simone Verdi, W/CM, 70, 1992, R
    Patrick Cutrone, ST, 74, 1998, R
    Alessandro Gabrielloni, ST, 68, 1994, R
  ` },
  {
    club: 'Torino', shortName: 'TOR', kit: kit('#7a1f2b', '#ffffff', 'red'), formation: '3-5-2', block: 'low', players: `
    Vanja Milinković-Savić, GK, 78, 1997, R
    Alberto Paleari, GK, 70, 1992, R
    Antonio Donnarumma, GK, 62, 1990, R
    Saúl Coco, CB, 74, 1999, R
    Guillermo Maripán, CB, 76, 1994, R
    Adam Masina, CB/FB, 73, 1994, L
    Sebastian Walukiewicz, CB/FB, 73, 2000, R
    Mërgim Vojvoda, FB, 74, 1995, R
    Marcus Pedersen, FB, 72, 2000, R
    Borna Sosa, FB, 74, 1998, L
    Valentino Lazaro, FB/WM, 74, 1996, R
    Samuele Ricci, DM/CM, 78, 2001, R
    Karol Linetty, CM, 74, 1995, R
    Ivan Ilić, CM, 75, 2001, L
    Adrien Tameze, CM/DM, 74, 1994, R
    Gvidas Gineitis, CM, 69, 2004, R
    Nikola Vlašić, CM/W, 77, 1997, R
    Yann Karamoh, W, 71, 1998, R
    Antonio Sanabria, ST, 75, 1996, R
    Duván Zapata, ST, 78, 1991, R
    Ché Adams, ST, 75, 1996, R
    Alieu Njie, ST, 66, 2005, R
  ` },
  {
    club: 'Udinese', shortName: 'UDI', kit: kit('#232527', '#ffffff', 'black'), formation: '3-5-2', block: 'low', players: `
    Maduka Okoye, GK, 75, 1999, R
    Razvan Sava, GK, 70, 2002, R
    Daniele Padelli, GK, 62, 1985, R
    Jaka Bijol, CB, 78, 1999, R
    Christian Kabasele, CB, 73, 1991, R
    Thomas Kristensen, CB, 74, 2002, R
    Isaak Touré, CB, 70, 2003, L
    Lautaro Giannetti, CB, 72, 1993, R
    Kingsley Ehizibue, FB, 72, 1995, R
    Jordan Zemura, FB, 72, 1999, L
    Hassane Kamara, FB, 74, 1994, L
    Jesper Karlström, DM, 75, 1995, R
    Sandi Lovrić, CM, 75, 1998, L
    Martín Payero, CM, 75, 1998, R
    Arthur Atta, CM, 70, 2003, R
    Oier Zarraga, CM, 71, 1999, R
    Jurgen Ekkelenkamp, CM, 74, 2000, R
    Florian Thauvin, W/CM, 78, 1993, L
    Iker Bravo, ST/W, 68, 2005, R
    Simone Pafundi, CM/W, 66, 2006, L
    Lorenzo Lucca, ST, 75, 2000, R
    Keinan Davis, ST, 72, 1998, R
    Brenner, ST, 70, 2000, R
  ` },
  {
    club: 'Genoa', shortName: 'GEN', kit: kit('#9b1b30', '#1b2a4a', 'red'), formation: '3-5-2', block: 'low', players: `
    Nicola Leali, GK, 72, 1993, R
    Pierluigi Gollini, GK, 74, 1995, R
    Mattia Bani, CB, 75, 1993, R
    Johan Vásquez, CB, 76, 1998, L
    Alessandro Vogliacco, CB, 72, 1998, R
    Koni De Winter, CB, 74, 2002, R
    Alan Matturro, CB, 70, 2004, L
    Stefano Sabelli, FB, 72, 1993, R
    Aarón Martín, FB, 74, 1997, L
    Alessandro Zanoli, FB, 72, 2000, R
    Brooke Norton-Cuffy, FB, 68, 2004, R
    Morten Frendrup, DM/CM, 77, 2001, R
    Milan Badelj, DM, 73, 1989, R
    Morten Thorsby, CM, 73, 1996, R
    Ruslan Malinovskyi, CM, 76, 1993, L
    Fabio Miretti, CM, 72, 2003, R
    Emil Bohinen, CM, 70, 1999, R
    Junior Messias, W, 74, 1991, L
    Vitor Oliveira, ST/W, 73, 2000, R, Vitinha
    Andrea Pinamonti, ST, 75, 1999, R
    Caleb Ekuban, ST, 70, 1994, R
    Jeff Ekhator, ST, 64, 2006, R
  ` },
  {
    club: 'Hellas Verona', shortName: 'HVE', kit: kit('#1b3b8f', '#f0c330', 'blue'), formation: '4-2-3-1', block: 'low', players: `
    Lorenzo Montipò, GK, 76, 1996, R
    Simone Perilli, GK, 66, 1995, R
    Diego Coppola, CB, 72, 2003, R
    Giangiacomo Magnani, CB, 72, 1995, R
    Paweł Dawidowicz, CB, 73, 1995, R
    Daniel Mosquera, ST, 70, 1999, R
    Fabien Ghilardi, CB, 68, 2003, R
    Jackson Tchatchoua, FB/WM, 72, 2001, R
    Martin Frese, FB, 70, 1998, L
    Domagoj Bradarić, FB, 72, 1999, L
    Davide Faraoni, FB, 71, 1991, R
    Ondrej Duda, CM, 76, 1994, R
    Suat Serdar, CM, 74, 1997, R
    Reda Belahyane, DM, 70, 2004, R
    Grigoris Kastanos, CM, 71, 1998, R
    Tomáš Suslov, CM/W, 74, 2002, R
    Darko Lazović, WM/W, 73, 1990, L
    Abdou Harroui, CM, 70, 1998, R
    Dailon Livramento, W/ST, 68, 2001, R
    Amin Sarr, W/ST, 70, 2001, R
    Casper Tengstedt, ST, 72, 2000, R
    Flavius Daniliuc, CB, 70, 2001, R
  ` },
  {
    club: 'Cagliari', shortName: 'CAG', kit: kit('#8e1f2f', '#1b2a4a', 'red'), formation: '4-2-3-1', block: 'low', players: `
    Simone Scuffet, GK, 75, 1996, R
    Alen Sherri, GK, 66, 1997, R
    Yerry Mina, CB, 75, 1994, R
    Sebastiano Luperto, CB, 74, 1996, L
    José Luis Palomino, CB, 72, 1990, L
    Mateusz Wieteska, CB, 72, 1997, R
    Adam Obert, CB/FB, 70, 2002, L
    Gabriele Zappa, FB, 73, 1999, R
    Paulo Azzi, FB, 71, 1994, L
    Tommaso Augello, FB, 72, 1994, L
    Antoine Makoumbou, DM/CM, 74, 1998, R
    Matteo Prati, DM, 72, 2003, R
    Michel Adopo, CM, 72, 2000, R
    Alessandro Deiola, CM, 71, 1995, R
    Răzvan Marin, CM, 74, 1996, R
    Nicolas Viola, CM, 70, 1989, R
    Gianluca Gaetano, CM/W, 74, 2000, R
    Nadir Zortea, FB/WM, 72, 1999, R
    Zito Luvumbo, W, 74, 2002, R
    Mattia Felici, W, 68, 2001, R
    Gianluca Lapadula, ST, 74, 1990, R
    Roberto Piccoli, ST, 73, 2001, R
    Leonardo Pavoletti, ST, 70, 1988, R
  ` },
  {
    club: 'Parma', shortName: 'PAR', kit: kit('#f2f2ee', '#1b2a4a', 'white'), formation: '4-2-3-1', block: 'low', players: `
    Zion Suzuki, GK, 76, 2002, R
    Leandro Chichizola, GK, 70, 1990, R
    Edoardo Corvi, GK, 62, 2001, R
    Enrico Delprato, CB/FB, 74, 1999, R
    Botond Balogh, CB, 72, 2002, R
    Yordan Osorio, CB, 73, 1994, R
    Alessandro Circati, CB, 73, 2003, R
    Lautaro Valenti, CB, 70, 1999, L
    Woyo Coulibaly, FB, 72, 1999, R
    Emanuele Valeri, FB, 72, 1998, L
    Gabriel Charpentier, ST, 69, 1999, R
    Adrián Bernabé, CM, 76, 2001, L
    Simon Sohm, CM, 74, 2001, R
    Nahuel Estévez, DM, 72, 1995, R
    Mandela Keita, DM, 72, 2002, R
    Hernani, CM, 71, 1994, R
    Wylan Cyprien, CM, 71, 1995, R
    Dennis Man, W, 75, 1998, L
    Valentin Mihăilă, W, 74, 2000, R
    Pontus Almqvist, W, 70, 1999, R
    Anas Haj Mohamed, W, 66, 2005, L
    Ange-Yoan Bonny, ST, 73, 2003, R
    Antoine Hainaut, FB, 66, 2002, R
  ` },
  {
    club: 'Lecce', shortName: 'LEC', kit: kit('#f0c330', '#c8102e', 'yellow'), formation: '4-3-3', block: 'low', players: `
    Wladimiro Falcone, GK, 77, 1995, R
    Christian Früchtl, GK, 68, 2000, R
    Kialonda Gaspar, CB, 73, 1997, R
    Federico Baschirotto, CB, 74, 1996, R
    Andy Pelmard, CB, 70, 2000, R
    Frédéric Guilbert, FB, 71, 1994, R
    Antonino Gallo, FB, 72, 2000, L
    Patrick Dorgu, FB/WM, 74, 2004, L
    Lameck Banda, W, 73, 2001, R
    Ylber Ramadani, DM, 74, 1996, R
    Balthazar Pierret, CM, 70, 2000, R
    Hamza Rafia, CM, 71, 1999, R
    Lassana Coulibaly, CM, 72, 1996, R
    Medon Berisha, CM, 66, 2003, R
    Mohamed Kaba, DM, 68, 2001, R
    Thórir Helgason, CM, 68, 2000, R
    Rémi Oudin, CM/W, 72, 1996, R
    Santiago Pierotti, W, 70, 2001, R
    Tete Morente, W, 72, 1996, R
    Nikola Krstović, ST, 75, 2000, R
    Ante Rebić, ST/W, 72, 1993, R
    Nicola Sansone, W, 69, 1991, R
  ` },
  {
    club: 'Empoli', shortName: 'EMP', kit: kit('#1d5fa8', '#ffffff', 'blue'), formation: '3-5-2', block: 'low', players: `
    Devis Vásquez, GK, 72, 1998, R
    Jacopo Seghetti, GK, 62, 2004, R
    Samuele Perisan, GK, 66, 1997, R
    Ardian Ismajli, CB, 74, 1996, R
    Saba Goglichidze, CB, 70, 2004, R
    Mattia Viti, CB, 70, 2002, L
    Luca Marianucci, CB, 66, 2004, R
    Stefano Gyasi, FB/WM, 70, 1994, R
    Giuseppe Pezzella, FB, 72, 1997, L
    Liberato Cacace, FB, 72, 2000, L
    Junior Sambia, FB, 70, 1996, R
    Tyronne Ebuehi, FB, 68, 1995, R
    Alberto Grassi, CM/DM, 72, 1995, R
    Liam Henderson, CM, 70, 1996, R
    Youssef Maleh, CM, 71, 1998, R
    Tino Anjorin, CM, 70, 2001, R
    Jacopo Fazzini, CM, 72, 2003, R
    Szymon Żurkowski, CM, 70, 1997, R
    Nicolas Haas, CM, 67, 1996, R
    Ola Solbakken, W, 70, 1998, R
    Sebastiano Esposito, ST/W, 72, 2002, L
    Lorenzo Colombo, ST, 72, 2002, R
    Pietro Pellegri, ST, 66, 2001, R
  ` },
  {
    club: 'Venezia', shortName: 'VEN', kit: kit('#232527', '#f08a24', 'black'), formation: '3-5-2', block: 'low', players: `
    Jesse Joronen, GK, 72, 1993, R
    Filip Stanković, GK, 70, 2002, R
    Joel Schingtienne, CB, 67, 2003, R
    Bjarki Steinn Bjarkason, W, 66, 2000, R
    Jay Idzes, CB, 73, 2000, R
    Michael Svoboda, CB, 72, 1998, R
    Marco Sverko, CB, 69, 1998, L
    Giorgio Altare, CB, 68, 1998, R
    Ridgeciano Haps, FB, 70, 1993, L
    Antonio Candela, FB, 70, 2000, R
    Francesco Zampano, FB, 69, 1993, R
    Mikael Ellertsson, FB/CM, 68, 2002, L
    Hans Nicolussi Caviglia, DM, 72, 2000, R
    Gianluca Busio, CM, 72, 2002, R
    Domen Črnigoj, CM, 69, 1995, R
    Magnus Andersen, CM, 66, 1999, R
    Issa Doumbia, CM, 68, 2003, R
    Gaetano Oristanio, W, 70, 2002, L
    John Yeboah, W, 68, 2000, R
    Christian Gytkjær, ST, 69, 1990, R
    Joel Pohjanpalo, ST, 72, 1994, R
    Nicholas Pierini, W, 66, 1998, R
  ` },
  {
    club: 'Monza', shortName: 'MON', kit: kit('#c8102e', '#ffffff', 'red'), formation: '3-4-3', block: 'low', players: `
    Stefano Turati, GK, 72, 2001, R
    Semuel Pizzignacco, GK, 66, 2001, R
    Pablo Marí, CB, 75, 1993, L
    Armando Izzo, CB, 72, 1992, R
    Luca Caldirola, CB, 71, 1991, L
    Danilo D’Ambrosio, CB, 71, 1988, R
    Andrea Carboni, CB, 70, 2001, L
    Georgios Kyriakopoulos, FB/WM, 74, 1996, L
    Pedro Pereira, FB, 71, 1998, R
    Samuele Birindelli, FB, 71, 1999, R
    Warren Bondo, CM, 70, 2003, R
    Matteo Pessina, CM, 76, 1997, R
    Roberto Gagliardini, CM/DM, 72, 1994, R
    Alessandro Bianco, CM, 70, 2002, R
    Stefano Sensi, CM, 72, 1995, R
    Jean-Daniel Akpa Akpro, CM, 70, 1992, R
    Daniel Maldini, CM/ST, 73, 2001, R
    Gianluca Caprari, W/ST, 73, 1993, R
    Dany Mota, W/ST, 72, 1998, R
    Milan Đurić, ST, 72, 1990, R
    Mirko Marić, ST, 70, 1995, L
    Patrick Ciurria, W, 71, 1995, R
  ` },
]
