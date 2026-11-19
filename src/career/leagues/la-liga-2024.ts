/**
 * La Liga 2024/25 for a real career: the twenty clubs and their first-team squads at the end of the
 * summer window (1 September 2024; loans at the club they went to). One player a line:
 * `Name, POS[/POS…], overall, born, foot[, known as]`, spelled as in the draft's squads files;
 * overalls are our estimate of his EA FC 25 rating. See premier-league-2024.ts.
 */
import type { RealClub } from '../real.ts'
import { kit } from '../../draft/squads.ts'

export const SEASON = 2024

export const CLUBS: RealClub[] = [
  {
    club: 'Real Madrid', shortName: 'RMA', kit: kit('#f2f2ee', '#1b2a4a', 'white'), formation: '4-3-3', players: `
    Thibaut Courtois, GK, 90, 1992, L
    Andriy Lunin, GK, 80, 1999, R
    Dani Carvajal, FB, 86, 1992, R
    Éder Militão, CB, 86, 1998, R
    Antonio Rüdiger, CB, 88, 1993, R
    David Alaba, CB, 84, 1992, L
    Jesús Vallejo, CB, 72, 1997, R
    Ferland Mendy, FB, 81, 1995, L
    Fran García, FB, 78, 1999, L
    Lucas Vázquez, FB/W, 80, 1991, R
    Raúl Asencio, CB, 66, 2003, R
    Aurélien Tchouaméni, DM/CB, 84, 2000, R
    Eduardo Camavinga, CM/DM/FB, 84, 2002, L
    Federico Valverde, CM/WM, 88, 1998, R
    Luka Modrić, CM, 86, 1985, R
    Jude Bellingham, CM, 90, 2003, R
    Dani Ceballos, CM, 79, 1996, R
    Arda Güler, CM/W, 77, 2005, L
    Brahim Díaz, CM/W, 82, 1999, R, Brahim
    Vinícius Júnior, W/ST, 90, 2000, R, Vinícius
    Rodrygo, W/ST, 86, 2001, R
    Kylian Mbappé, ST/W, 91, 1998, R
    Endrick, ST, 77, 2006, L
  ` },
  {
    club: 'Barcelona', shortName: 'BAR', kit: kit('#a50044', '#edbb00', 'red'), formation: '4-2-3-1', players: `
    Marc-André ter Stegen, GK, 89, 1992, R
    Iñaki Peña, GK, 76, 1999, R
    Pau Cubarsí, CB, 80, 2007, R
    Iñigo Martínez, CB, 82, 1991, L
    Ronald Araújo, CB, 85, 1999, R
    Andreas Christensen, CB/DM, 82, 1996, R
    Eric García, CB/FB, 77, 2001, R
    Jules Koundé, FB/CB, 86, 1998, R
    Alejandro Balde, FB, 81, 2003, L
    Héctor Fort, FB, 69, 2006, R
    Gerard Martín, FB, 70, 2002, L
    Marc Casadó, DM, 77, 2003, R
    Frenkie de Jong, CM/DM, 85, 1997, R
    Marc Bernal, DM, 70, 2007, R
    Pedri, CM, 87, 2002, R
    Gavi, CM, 81, 2004, R
    Dani Olmo, CM/W, 85, 1998, R
    Fermín López, CM, 78, 2003, R
    Pablo Torre, CM, 72, 2003, L
    Lamine Yamal, W, 81, 2007, L
    Raphinha, W, 87, 1996, L
    Ansu Fati, W/ST, 74, 2002, R
    Ferran Torres, ST/W, 79, 2000, R
    Robert Lewandowski, ST, 88, 1988, R
    Pau Víctor, ST, 69, 2001, R
  ` },
  {
    club: 'Atlético Madrid', shortName: 'ATM', kit: kit('#cb3524', '#ffffff', 'red'), formation: '4-4-2', players: `
    Jan Oblak, GK, 88, 1993, R
    Juan Musso, GK, 78, 1994, R
    José María Giménez, CB, 84, 1995, R
    Robin Le Normand, CB, 83, 1996, R
    Clément Lenglet, CB, 78, 1995, L
    Axel Witsel, CB/DM, 79, 1989, R
    Reinildo Mandava, FB/CB, 77, 1994, L, Reinildo
    César Azpilicueta, FB/CB, 77, 1989, R
    Nahuel Molina, FB, 81, 1998, R
    Javi Galán, FB, 77, 1994, L
    Koke, CM/DM, 83, 1992, R
    Rodrigo De Paul, CM, 84, 1994, R
    Conor Gallagher, CM, 82, 2000, R
    Pablo Barrios, CM, 76, 2003, R
    Marcos Llorente, CM/FB/W, 83, 1995, R
    Thomas Lemar, W/CM, 78, 1995, L
    Samuel Lino, WM/W, 78, 1999, L
    Rodrigo Riquelme, W, 76, 2000, L
    Giuliano Simeone, W, 72, 2002, R
    Antoine Griezmann, ST/CM, 88, 1991, L
    Julián Álvarez, ST/W, 84, 2000, R
    Alexander Sørloth, ST, 81, 1995, R
    Ángel Correa, ST/W, 80, 1995, R
  ` },
  {
    club: 'Athletic Club', shortName: 'ATH', kit: kit('#ee2523', '#ffffff', 'red'), formation: '4-2-3-1', players: `
    Unai Simón, GK, 85, 1997, R
    Julen Agirrezabala, GK, 75, 2000, R
    Álex Padilla, GK, 68, 2003, R
    Dani Vivian, CB, 82, 1999, R
    Yeray Álvarez, CB, 80, 1995, L
    Aitor Paredes, CB, 77, 2000, R
    Unai Núñez, CB, 73, 1997, R
    Óscar de Marcos, FB, 78, 1989, R
    Iñigo Lekue, FB, 74, 1993, R
    Yuri Berchiche, FB, 78, 1990, L
    Andoni Gorosabel, FB, 75, 1996, R
    Íñigo Ruiz de Galarreta, DM, 79, 1993, R
    Mikel Jauregizar, DM, 70, 2003, R
    Mikel Vesga, DM, 77, 1993, L
    Beñat Prados, DM, 75, 2001, R
    Oihan Sancet, CM, 82, 2000, R
    Unai Gómez, CM/W, 74, 2003, R
    Álex Berenguer, W/ST, 79, 1995, R
    Nico Williams, W, 84, 2002, R
    Iñaki Williams, W/ST, 82, 1994, R
    Gorka Guruzeta, ST, 78, 1996, R
    Maroan Sannadi, ST, 68, 2001, R
    Adama Boiro, FB, 70, 2002, L
  ` },
  {
    club: 'Villarreal', shortName: 'VIL', kit: kit('#ffe667', '#004f9f', 'yellow'), formation: '4-4-2', players: `
    Diego Conde, GK, 77, 1998, R
    Luiz Júnior, GK, 75, 2001, R
    Raúl Albiol, CB, 79, 1985, R
    Logan Costa, CB, 77, 2001, R
    Eric Bailly, CB, 74, 1994, R
    Willy Kambwala, CB, 70, 2004, R
    Juan Foyth, CB/FB, 79, 1998, R
    Kiko Femenía, FB, 76, 1991, R
    Alfonso Pedraza, FB, 79, 1996, L
    Sergi Cardona, FB, 75, 1999, L
    Dani Parejo, CM, 81, 1989, R
    Santi Comesaña, CM, 77, 1996, R
    Pape Gueye, DM, 76, 1999, L
    Ramón Terrats, CM, 74, 2000, R
    Denis Suárez, CM, 74, 1994, R
    Álex Baena, W/CM, 82, 2001, L
    Yeremy Pino, W, 79, 2002, R
    Ilias Akhomach, W, 73, 2004, L
    Nicolas Pépé, W, 76, 1995, L
    Ayoze Pérez, ST/W, 79, 1993, R
    Gerard Moreno, ST, 80, 1992, L
    Thierno Barry, ST, 74, 2002, R
  ` },
  {
    club: 'Real Betis', shortName: 'BET', kit: kit('#00954c', '#ffffff', 'green'), formation: '4-2-3-1', players: `
    Rui Silva, GK, 80, 1994, R
    Adrián, GK, 72, 1987, R
    Fran Vieites, GK, 65, 1999, R
    Diego Llorente, CB, 77, 1993, R
    Marc Bartra, CB, 76, 1991, R
    Natan, CB, 75, 2001, L
    Romain Perraud, FB, 75, 1997, L
    Héctor Bellerín, FB, 76, 1995, R
    Youssouf Sabaly, FB, 75, 1993, R
    Ricardo Rodríguez, FB/CB, 76, 1992, L
    Aitor Ruibal, FB/W, 74, 1996, R
    Johnny Cardoso, DM/CM, 77, 2001, R
    Marc Roca, DM/CM, 77, 1996, R
    Sergi Altimira, CM, 72, 2001, R
    Pablo Fornals, CM/W, 78, 1996, R
    Giovani Lo Celso, CM/W, 79, 1996, L
    Isco, CM/W, 82, 1992, R
    Iker Losada, W/CM, 73, 2001, R
    Abde Ezzalzouli, W, 76, 2001, R, Abde
    Juanmi, W/ST, 74, 1993, R
    Vitor Roque, ST, 74, 2005, R
    Chimy Ávila, ST, 76, 1994, R
    Cédric Bakambu, ST, 74, 1991, R
    Assane Diao, W, 68, 2005, R
  ` },
  {
    club: 'Celta Vigo', shortName: 'CEL', kit: kit('#8ac3ee', '#c8102e', 'blue'), formation: '3-4-3', players: `
    Vicente Guaita, GK, 76, 1987, R
    Iván Villar, GK, 72, 1997, R
    Carl Starfelt, CB, 76, 1995, R
    Carlos Domínguez, CB, 72, 2001, R
    Joseph Aidoo, CB, 74, 1995, R
    Marcos Alonso, CB/FB, 77, 1990, L
    Javi Rodríguez, CB, 68, 2003, R
    Óscar Mingueza, FB/CB, 76, 1999, R
    Javi Manquillo, FB, 72, 1994, R
    Hugo Álvarez, FB/W, 68, 2003, L
    Mihailo Ristić, FB, 72, 1995, L
    Fran Beltrán, DM/CM, 76, 1999, R
    Ilaix Moriba, CM, 74, 2003, R
    Damián Rodríguez, CM, 68, 2003, R
    Hugo Sotelo, CM, 66, 2003, R
    Luca de la Torre, CM, 72, 1998, R
    Franco Cervi, W, 72, 1994, L
    Williot Swedberg, W/CM, 72, 2004, R
    Jonathan Bamba, W, 75, 1996, R
    Iago Aspas, ST, 82, 1987, L
    Borja Iglesias, ST, 76, 1993, R
    Anastasios Douvikas, ST, 73, 1999, R
    Pablo Durán, ST, 68, 2001, R
    Alfon González, W, 71, 1999, L
  ` },
  {
    club: 'Rayo Vallecano', shortName: 'RAY', kit: kit('#f2f2ee', '#d4202c', 'white'), formation: '4-2-3-1', players: `
    Augusto Batalla, GK, 76, 1996, R
    Dani Cárdenas, GK, 71, 1997, R
    Abdul Mumin, CB, 75, 1998, R
    Florian Lejeune, CB, 77, 1991, L
    Aridane Hernández, CB, 74, 1989, L
    Pep Chavarría, FB, 74, 1998, L
    Iván Balliu, FB, 74, 1992, R
    Andrei Rațiu, FB, 75, 1998, R
    Alfonso Espino, FB, 74, 1992, L
    Pathé Ciss, DM, 76, 1994, R
    Óscar Valentín, DM, 77, 1994, R
    Unai López, CM, 75, 1995, R
    Óscar Trejo, CM/ST, 77, 1988, R
    Isi Palazón, W/CM, 78, 1994, L
    Jorge de Frutos, W, 77, 1997, R
    Álvaro García, W, 77, 1992, L
    Adrián Embarba, W, 73, 1992, R
    Randy Nteka, ST, 72, 1997, R
    Sergio Camello, ST, 75, 2001, R
    Raúl de Tomás, ST, 74, 1994, R
    Gerard Gumbau, CM, 73, 1994, R
    James Rodríguez, CM/W, 77, 1991, L
  ` },
  {
    club: 'Osasuna', shortName: 'OSA', kit: kit('#d91a21', '#0a2c5a', 'red'), formation: '4-2-3-1', players: `
    Sergio Herrera, GK, 78, 1993, R
    Aitor Fernández, GK, 75, 1991, R
    Alejandro Catena, CB, 77, 1994, R
    Enzo Boyomo, CB, 74, 2001, R
    Jorge Herrando, CB, 72, 2001, R
    Juan Cruz, CB/FB, 73, 1992, L
    Jesús Areso, FB, 75, 1999, R
    Abel Bretones, FB, 73, 2000, L
    Nacho Vidal, FB, 72, 1995, R
    Lucas Torró, DM, 77, 1994, R
    Jon Moncayola, CM/DM, 77, 1998, R
    Pablo Ibáñez, CM, 72, 1998, R
    Iker Muñoz, CM, 70, 2002, R
    Aimar Oroz, CM/W, 77, 2001, R
    Moi Gómez, CM/W, 76, 1994, R
    Rubén García, W, 75, 1993, L
    Kike Barja, W, 72, 1997, L
    Bryan Zaragoza, W, 76, 2001, R
    Ante Budimir, ST, 79, 1991, R
    Raúl García, ST, 72, 2000, R
    Rubén Peña, FB/W, 72, 1991, R
    Unai García, CB, 72, 1992, R
  ` },
  {
    club: 'Mallorca', shortName: 'MLL', kit: kit('#c8102e', '#111111', 'red'), formation: '4-4-2', players: `
    Dominik Greif, GK, 76, 1997, R
    Leo Román, GK, 72, 2000, R
    Ivan Cuéllar, GK, 66, 1984, R
    Martin Valjent, CB, 78, 1995, R
    Antonio Raíllo, CB, 77, 1991, R
    José Copete, CB, 74, 1999, R
    Siebe Van der Heyden, CB, 73, 1998, L
    Pablo Maffeo, FB, 77, 1997, R
    Johan Mojica, FB, 75, 1992, L
    Toni Lato, FB, 72, 1997, L
    Mateu Morey, FB, 70, 2000, R
    Samú Costa, DM, 77, 2000, R
    Omar Mascarell, DM, 74, 1993, R
    Manu Morlanes, CM, 75, 1999, R
    Antonio Sánchez, CM/WM, 74, 1997, R
    Dani Rodríguez, CM/WM, 75, 1988, R
    Sergi Darder, CM, 78, 1993, R
    Robert Navarro, W, 73, 2002, L
    Chiquinho, W, 71, 2000, R
    Takuma Asano, ST/W, 74, 1994, R
    Vedat Muriqi, ST, 78, 1994, R
    Cyle Larin, ST, 74, 1995, R
    Abdón Prats, ST, 70, 1992, R
  ` },
  {
    club: 'Real Sociedad', shortName: 'RSO', kit: kit('#0067b1', '#ffffff', 'blue'), formation: '4-3-3', players: `
    Álex Remiro, GK, 83, 1995, R
    Unai Marrero, GK, 70, 2001, R
    Igor Zubeldia, CB, 80, 1997, R
    Nayef Aguerd, CB, 78, 1996, L
    Jon Pacheco, CB, 75, 2001, L
    Jon Martín, CB, 66, 2006, R
    Aritz Elustondo, CB/FB, 74, 1994, R
    Hamari Traoré, FB, 76, 1992, R
    Jon Mikel Aramburu, FB, 72, 2002, R
    Aihen Muñoz, FB, 75, 1997, L
    Javi López, FB, 70, 2002, L
    Martín Zubimendi, DM, 84, 1999, R
    Beñat Turrientes, CM, 74, 2002, R
    Brais Méndez, CM/W, 81, 1997, L
    Luka Sučić, CM, 76, 2002, R
    Arsen Zakharyan, CM/W, 75, 2003, R
    Jon Ander Olasagasti, CM, 72, 2000, R
    Takefusa Kubo, W, 82, 2001, L
    Ander Barrenetxea, W, 77, 2001, L
    Sheraldo Becker, W, 75, 1995, R
    Pablo Marín, CM, 68, 2003, R
    Mikel Oyarzabal, ST/W, 83, 1997, L
    Orri Óskarsson, ST, 72, 2004, L
    Umar Sadiq, ST, 74, 1997, R
  ` },
  {
    club: 'Valencia', shortName: 'VAL', kit: kit('#f4f4f0', '#111111', 'white'), formation: '4-4-2', players: `
    Giorgi Mamardashvili, GK, 83, 2000, R
    Stole Dimitrievski, GK, 72, 1993, R
    Jaume Doménech, GK, 70, 1990, R
    Mouctar Diakhaby, CB, 77, 1996, L
    Cristhian Mosquera, CB, 76, 2004, R
    César Tárrega, CB, 72, 2002, R
    Yarek Gasiorowski, CB, 68, 2005, L
    José Luis Gayà, FB, 80, 1995, L, Gayà
    Dimitri Foulquier, FB, 74, 1993, R
    Jesús Vázquez, FB, 70, 2003, L
    Thierry Correia, FB, 74, 1999, R
    Pepelu, DM, 78, 1998, R
    Javi Guerra, CM, 77, 2003, R
    Enzo Barrenechea, DM, 74, 2001, R
    Hugo Guillamón, DM/CB, 75, 2000, R
    André Almeida, CM, 75, 2000, R
    Diego López, W, 75, 2002, L
    Luis Rioja, W, 76, 1993, R
    Fran Pérez, W, 72, 2002, R
    Rafa Mir, ST, 74, 1997, R
    Hugo Duro, ST, 76, 1999, R
    Dani Gómez, ST, 70, 1998, R
    Sergi Canós, W, 73, 1997, R
  ` },
  {
    club: 'Getafe', shortName: 'GET', kit: kit('#005999', '#ffffff', 'blue'), formation: '4-4-2', players: `
    David Soria, GK, 80, 1993, R
    Jiří Letáček, GK, 70, 1999, R
    Dakonam Djené, CB, 79, 1991, R, Djené
    Omar Alderete, CB, 76, 1996, L
    Domingos Duarte, CB, 75, 1995, R
    Juan Iglesias, FB, 74, 1998, R
    Diego Rico, FB, 74, 1993, L
    Allan Nyom, FB, 71, 1988, R
    Mauro Arambarri, CM/DM, 79, 1995, R
    Luis Milla, CM, 78, 1994, R
    Yellu Santiago, CM, 68, 2004, R
    Carles Aleñá, CM, 74, 1998, L
    Christantus Uche, CM/ST, 72, 2003, R
    Álex Sola, W, 72, 1999, R
    Coba da Costa, W, 68, 2002, R
    Peter Federico, W, 68, 2002, R
    Borja Mayoral, ST, 77, 1997, R
    Bertug Yildirim, ST, 72, 2002, R
    Alberto Risco, W, 66, 2003, R
    Juan Berrocal, CB, 72, 1999, R
    Carles Pérez, W, 74, 1998, L
    Álvaro Rodríguez, ST, 70, 2004, R
    Juan Bernat, FB, 72, 1993, L
  ` },
  {
    club: 'Espanyol', shortName: 'ESP', kit: kit('#007fc8', '#ffffff', 'blue'), formation: '4-4-2', players: `
    Joan García, GK, 76, 2001, L
    Fernando Pacheco, GK, 74, 1992, R
    Ángel Fortuño, GK, 64, 2001, R
    Leandro Cabrera, CB, 75, 1991, L
    Sergi Gómez, CB, 72, 1992, R
    Marash Kumbulla, CB, 74, 2000, R
    Fernando Calero, CB, 72, 1995, R
    Omar El Hilali, FB, 72, 2003, R
    Carlos Romero, FB, 71, 2001, L
    Brian Oliván, FB, 72, 1994, L
    Rubén Sánchez, FB, 70, 2001, R
    Pol Lozano, CM, 74, 1999, R
    Edu Expósito, CM, 75, 1996, R
    Alex Král, DM, 74, 1998, R
    José Gragera, DM, 72, 2000, R
    Urko González de Zárate, DM, 70, 2001, R
    Jofre Carreras, W, 70, 2001, R
    Álvaro Aguado, CM, 72, 1996, R
    Pere Milla, W/ST, 73, 1992, R
    Javi Puado, ST/W, 76, 1998, R
    Alejo Véliz, ST, 72, 2003, R
    Irvin Cardona, ST, 72, 1997, R
    Walid Cheddira, ST, 72, 1998, R
  ` },
  {
    club: 'Alavés', shortName: 'ALA', kit: kit('#1a3e8f', '#ffffff', 'blue'), formation: '4-4-2', players: `
    Antonio Sivera, GK, 76, 1996, R
    Owono, GK, 70, 2001, R
    Abdel Abqar, CB, 73, 1999, R
    Aleksandar Sedlar, CB, 72, 1991, R
    Santiago Mouriño, CB, 73, 2002, R
    Moussa Diarra, CB, 72, 2000, L
    Nahuel Tenaglia, CB/FB, 74, 1996, R
    Manu Sánchez, FB, 74, 2000, L
    Hugo Novoa, W/FB, 69, 2003, R
    Antonio Blanco, DM, 74, 2000, R
    Ander Guevara, DM/CM, 74, 1997, R
    Jon Guridi, CM, 74, 1995, R
    Carlos Benavidez, CM, 72, 1998, R
    Joan Jordán, CM, 73, 1994, R
    Carlos Vicente, W, 74, 1999, R
    Abde Rebbach, W, 71, 1998, L
    Jon Ander Aguirregabiria, FB, 70, 1996, R
    Tomás Conechny, W, 70, 1998, L
    Luka Romero, W, 68, 2004, L
    Kike García, ST, 74, 1989, R
    Toni Martínez, ST, 72, 1997, R
    Stoichkov, ST/W, 72, 1993, R
    Asier Villalibre, ST, 72, 1997, R
  ` },
  {
    club: 'Girona', shortName: 'GIR', kit: kit('#cd2534', '#ffffff', 'red'), formation: '4-3-3', players: `
    Paulo Gazzaniga, GK, 79, 1992, R
    Juan Carlos, GK, 70, 1988, R
    Pau López, GK, 75, 1994, L
    David López, CB, 76, 1989, R
    Daley Blind, CB/FB, 77, 1990, L
    Ladislav Krejčí, CB/DM, 76, 1999, L
    Juanpe, CB, 73, 1991, R
    Alejandro Francés, CB, 73, 2002, R
    Miguel Gutiérrez, FB, 80, 2001, L
    Arnau Martínez, FB/CB, 77, 2003, R
    Ricard Artero, FB, 64, 2003, R
    Yangel Herrera, CM/DM, 79, 1998, R
    Iván Martín, CM, 78, 1999, R
    Oriol Romeu, DM, 76, 1991, R
    Donny van de Beek, CM, 75, 1997, R
    Jhon Solís, DM, 72, 2004, R
    Viktor Tsygankov, W, 80, 1997, L
    Bryan Gil, W, 75, 2001, L
    Yáser Asprilla, W, 74, 2003, L
    Arnaut Danjuma, W, 76, 1997, R
    Portu, W/ST, 73, 1992, R
    Cristhian Stuani, ST, 76, 1986, R
    Abel Ruiz, ST, 74, 2000, R
    Bojan Miovski, ST, 74, 1999, R
  ` },
  {
    club: 'Sevilla', shortName: 'SEV', kit: kit('#f4f4f0', '#d2152b', 'white'), formation: '4-3-3', players: `
    Ørjan Nyland, GK, 76, 1990, R
    Álvaro Fernández, GK, 72, 1998, R
    Loïc Badé, CB, 79, 2000, R
    Nemanja Gudelj, CB/DM, 77, 1991, R
    Kike Salas, CB, 74, 2002, L
    Tanguy Nianzou, CB, 73, 2002, R
    Marcão, CB, 75, 1996, L
    Juanlu Sánchez, FB, 74, 2003, R
    José Ángel Carmona, FB, 74, 2002, R
    Adrià Pedrosa, FB, 75, 1998, L
    Valentín Barco, FB/W, 72, 2004, L
    Albert Sambi Lokonga, CM/DM, 74, 1999, L
    Lucien Agoumé, DM, 75, 2002, R
    Saúl Ñíguez, CM, 77, 1994, L
    Djibril Sow, CM, 77, 1997, R
    Peque Fernández, CM/W, 72, 2002, R, Peque
    Dodi Lukébakio, W, 79, 1997, L
    Chidera Ejuke, W, 75, 1998, R
    Stanis Idumbo-Muzambo, W, 68, 2005, R
    Suso, W/CM, 74, 1993, L
    Isaac Romero, ST, 74, 2000, R
    Kelechi Iheanacho, ST, 75, 1996, L
    Jesús Navas, FB/W, 76, 1985, R
  ` },
  {
    club: 'Leganés', shortName: 'LEG', kit: kit('#f2f2ee', '#1b3f8f', 'white'), formation: '4-4-2', players: `
    Marko Dmitrović, GK, 76, 1992, R
    Juan Soriano, GK, 72, 1997, R
    Sergio González, CB, 74, 1992, R
    Matija Nastasić, CB, 73, 1993, L
    Jorge Sáenz, CB, 73, 1996, R
    Adrià Altimira, FB, 71, 2001, R
    Valentin Rosier, FB, 73, 1996, R
    Javi Hernández, FB, 72, 1998, L
    Enric Franquesa, FB, 72, 1997, L
    Jackson Porozo, CB, 70, 2000, R
    Renato Tapia, DM, 75, 1995, R
    Seydouba Cissé, DM/CM, 71, 2001, R
    Yvan Neyou, CM, 72, 1997, R
    Darko Brašanac, CM, 72, 1992, R
    Julián Chicco, CM, 70, 1998, R
    Óscar Rodríguez, CM, 73, 1998, R
    Juan Cruz Díaz, W, 72, 2000, L, Juan Cruz
    Dani Raba, W/ST, 73, 1995, R
    Munir El Haddadi, W/ST, 72, 1995, L, Munir
    Yan Diomandé, W, 66, 2006, R
    Diego García, ST, 70, 2000, R
    Miguel de la Fuente, ST, 70, 1999, R
    Sébastien Haller, ST, 74, 1994, R
    Roberto López, W, 68, 2000, R
  ` },
  {
    club: 'Las Palmas', shortName: 'LPA', kit: kit('#ffe500', '#0057a8', 'yellow'), formation: '4-2-3-1', players: `
    Jasper Cillessen, GK, 77, 1989, R
    Dinko Horkaš, GK, 70, 1999, R
    Álex Suárez, CB/FB, 73, 1993, R
    Mika Mármol, CB, 74, 2001, L
    Scott McKenna, CB, 74, 1996, L
    Juanma Herzog, CB, 71, 2001, R
    Eric Curbelo, CB, 71, 1994, R
    Viti Rozada, FB, 72, 1997, R
    Marvin Park, FB, 70, 2000, R
    Álex Muñoz, FB, 72, 1994, L
    Kirian Rodríguez, CM, 77, 1996, R
    Javier Muñoz, CM, 72, 1995, R
    Dário Essugo, DM, 70, 2005, R
    José Campaña, CM, 73, 1993, L
    Enzo Loiodice, CM, 72, 2000, R
    Alberto Moleiro, CM/W, 76, 2003, L
    Sandro Ramírez, W/ST, 74, 1995, R
    Adnan Januzaj, W, 74, 1995, L
    Benito Ramírez, W, 69, 1995, R
    Manu Fuster, CM/W, 70, 1997, R
    Fábio Silva, ST, 73, 2002, R
    Marc Cardona, ST, 70, 1995, R
    Oliver McBurnie, ST, 73, 1996, R
  ` },
  {
    club: 'Real Valladolid', shortName: 'VLL', kit: kit('#5b2a86', '#ffffff', 'purple'), formation: '4-4-2', players: `
    Karl Hein, GK, 71, 2002, R
    André Ferreira, GK, 72, 1996, R
    Javi Sánchez, CB, 73, 1997, R
    David Torres, CB, 70, 2003, R
    Eray Cömert, CB, 72, 1998, R
    Cenk Özkacar, CB, 71, 2000, L
    Luis Pérez, FB, 72, 1995, R
    Lucas Rosa, FB, 70, 2000, L
    Iván Fresneda, FB, 70, 2004, R
    Selim Amallah, CM, 72, 1996, R
    Kike Pérez, CM, 73, 1997, R
    Stanko Jurić, DM, 72, 2001, R
    Mario Martín, CM, 70, 2004, R
    Víctor Meseguer, CM, 71, 1999, R
    Juanmi Latasa, ST, 72, 2001, R
    Raúl Moro, W, 71, 2002, R
    Iván Sánchez, W, 72, 1992, R
    Anuar Mohamed, W, 69, 2001, R
    Kenedy, W, 72, 1996, L
    Darwin Machís, W, 72, 1993, R
    Mamadou Sylla, ST, 72, 1994, R
    Marcos André, ST, 72, 1996, R
    Chuki, CM/W, 66, 2004, L
  ` },
]
