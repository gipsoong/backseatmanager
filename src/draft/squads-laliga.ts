/** Draft mode's La Liga clubs: squads of single seasons, 2010/11 to 2024/25 (see squads.ts). */
import type { Archetype } from '../engine/index.ts'
import { kit, pool, type Pool } from './squads.ts'

const WHITE = kit('#f2f2ee', '#1b2a4a', 'white')
const BARCA = kit('#a50044', '#edbb00', 'red')
const ATLETI = kit('#cb3524', '#ffffff', 'red')
const SEVILLA = kit('#f4f4f0', '#d2152b', 'white')
const VALENCIA = kit('#f4f4f0', '#111111', 'white')
const YELLOW = kit('#ffe667', '#004f9f', 'yellow')
const REAL_SOCIEDAD = kit('#0067b1', '#ffffff', 'blue')
const ATHLETIC = kit('#ee2523', '#ffffff', 'red')
const BETIS = kit('#00954c', '#ffffff', 'green')
const SKY = kit('#79b4e0', '#10263d', 'blue')
const ROYAL = kit('#005999', '#ffffff', 'blue')
const ESPANYOL = kit('#007fc8', '#ffffff', 'blue')
const GIRONA = kit('#cd2534', '#ffffff', 'red')
const DEPOR = kit('#1f4fa0', '#ffffff', 'blue')
const OSASUNA = kit('#d91a21', '#0a2c5a', 'red')
const RAYO = kit('#f2f2ee', '#d4202c', 'white')
const LEVANTE = kit('#1b3f8f', '#ffffff', 'blue')
const EIBAR = kit('#a3162f', '#ffffff', 'red')
const GRANADA = kit('#c8202f', '#ffffff', 'red')
const LAS_PALMAS = kit('#ffd500', '#0b4ea2', 'yellow')
const VALLADOLID = kit('#5b2a86', '#ffffff', 'purple')
const MALLORCA = kit('#c8102e', '#111111', 'red')

export const POOLS: Pool[] = [
  pool('Real Madrid', 'RMA', '2011/12', WHITE, '4-2-3-1', `
    Iker Casillas, GK, 90
    Antonio Adán, GK, 70
    Jerzy Dudek, GK, 72
    Sergio Ramos, CB/FB, 87
    Pepe, CB, 86
    Raúl Albiol, CB, 80
    Raphaël Varane, CB, 70
    Marcelo, FB, 84
    Fábio Coentrão, FB/CM, 82
    Álvaro Arbeloa, FB, 79
    Hamit Altıntop, FB/CM, 78
    Xabi Alonso, DM, 87
    Sami Khedira, CM/DM, 82
    Lassana Diarra, DM, 80
    Nuri Şahin, CM, 80
    Esteban Granero, CM, 79
    Mesut Özil, CM/W, 87
    Kaká, CM, 85
    Ángel Di María, W/WM, 84
    José Callejón, W, 77
    Cristiano Ronaldo, W/ST, 92
    Karim Benzema, ST, 85
    Gonzalo Higuaín, ST, 85
  `),
  pool('Real Madrid', 'RMA', '2013/14', WHITE, '4-3-3', `
    Iker Casillas, GK, 87
    Diego López, GK, 83
    Sergio Ramos, CB, 86
    Pepe, CB, 85
    Raphaël Varane, CB, 80
    Nacho Fernández, CB/FB, 72, Nacho
    Marcelo, FB, 83
    Fábio Coentrão, FB, 81
    Dani Carvajal, FB, 77
    Álvaro Arbeloa, FB, 78
    Xabi Alonso, DM, 86
    Casemiro, DM, 72
    Asier Illarramendi, DM/CM, 78
    Luka Modrić, CM, 85
    Sami Khedira, CM, 82
    Isco, CM/W, 82
    Ángel Di María, W/CM, 85
    Gareth Bale, W, 86
    Cristiano Ronaldo, W/ST, 92
    Jesé, W/ST, 73
    Karim Benzema, ST, 84
    Álvaro Morata, ST, 75
  `),
  pool('Real Madrid', 'RMA', '2016/17', WHITE, '4-3-3', `
    Keylor Navas, GK, 85
    Kiko Casilla, GK, 79
    Sergio Ramos, CB, 90
    Raphaël Varane, CB, 85
    Pepe, CB, 84
    Nacho Fernández, CB/FB, 78, Nacho
    Marcelo, FB, 87
    Dani Carvajal, FB, 84
    Danilo, FB, 78
    Fábio Coentrão, FB, 78
    Casemiro, DM, 84
    Toni Kroos, CM, 88
    Luka Modrić, CM, 89
    Mateo Kovačić, CM, 81
    Isco, CM/W, 85
    James Rodríguez, CM/W, 86, James
    Marco Asensio, W/CM, 78
    Lucas Vázquez, W/FB, 78
    Gareth Bale, W, 89
    Cristiano Ronaldo, ST/W, 94
    Karim Benzema, ST, 86
    Álvaro Morata, ST, 82
    Mariano Díaz, ST, 70, Mariano
  `),
  pool('Real Madrid', 'RMA', '2021/22', WHITE, '4-3-3', `
    Thibaut Courtois, GK, 89
    Andriy Lunin, GK, 74
    Éder Militão, CB, 84
    David Alaba, CB/FB, 86
    Nacho Fernández, CB/FB, 79, Nacho
    Jesús Vallejo, CB, 72
    Dani Carvajal, FB, 85
    Ferland Mendy, FB, 83
    Lucas Vázquez, FB/W, 80
    Marcelo, FB, 81
    Casemiro, DM, 89
    Toni Kroos, CM, 88
    Luka Modrić, CM, 87
    Federico Valverde, CM/WM, 83
    Eduardo Camavinga, CM/DM, 79
    Dani Ceballos, CM, 78
    Isco, CM, 79
    Vinícius Júnior, W, 84, Vinícius
    Rodrygo, W/ST, 79
    Marco Asensio, W, 81
    Eden Hazard, W, 85
    Karim Benzema, ST, 89
    Luka Jović, ST, 76
    Mariano Díaz, ST, 72, Mariano
  `),
  pool('Real Madrid', 'RMA', '2023/24', WHITE, '4-4-2', `
    Thibaut Courtois, GK, 90
    Andriy Lunin, GK, 80
    Kepa Arrizabalaga, GK, 82, Kepa
    Antonio Rüdiger, CB, 86
    Éder Militão, CB, 86
    David Alaba, CB, 85
    Nacho Fernández, CB/FB, 79, Nacho
    Dani Carvajal, FB, 85
    Ferland Mendy, FB, 82
    Fran García, FB, 77
    Lucas Vázquez, FB/W, 79
    Aurélien Tchouaméni, DM/CB, 84
    Toni Kroos, CM, 86
    Luka Modrić, CM, 86
    Federico Valverde, CM/WM, 88
    Eduardo Camavinga, CM/DM/FB, 83
    Dani Ceballos, CM, 79
    Jude Bellingham, CM, 86
    Arda Güler, CM/W, 77
    Brahim Díaz, CM/W, 80, Brahim
    Vinícius Júnior, W/ST, 89, Vinícius
    Rodrygo, W/ST, 85
    Joselu, ST, 77
  `),
  pool('Barcelona', 'BAR', '2010/11', BARCA, '4-3-3', `
    Víctor Valdés, GK, 85
    José Manuel Pinto, GK, 74, Pinto
    Carles Puyol, CB, 87
    Gerard Piqué, CB, 86
    Javier Mascherano, CB/DM, 84
    Gabriel Milito, CB, 79
    Andreu Fontàs, CB, 67
    Dani Alves, FB, 87
    Eric Abidal, FB/CB, 83
    Maxwell, FB, 79
    Adriano Correia, FB/WM, 79, Adriano
    Sergio Busquets, DM, 85
    Seydou Keita, CM/DM, 80
    Xavi Hernández, CM, 92, Xavi
    Andrés Iniesta, CM/W, 91
    Thiago Alcântara, CM, 70, Thiago
    Ibrahim Afellay, W/CM, 77
    Pedro, W, 82
    Lionel Messi, W/ST/CM, 94
    David Villa, ST/W, 87
    Bojan Krkić, ST/W, 76, Bojan
  `),
  pool('Barcelona', 'BAR', '2014/15', BARCA, '4-3-3', `
    Claudio Bravo, GK, 83
    Marc-André ter Stegen, GK, 83
    Gerard Piqué, CB, 84
    Javier Mascherano, CB/DM, 83
    Jérémy Mathieu, CB/FB, 79
    Thomas Vermaelen, CB, 79
    Marc Bartra, CB, 76
    Dani Alves, FB, 83
    Jordi Alba, FB, 82
    Adriano Correia, FB, 77, Adriano
    Martín Montoya, FB, 74
    Sergio Busquets, DM, 85
    Ivan Rakitić, CM, 83
    Andrés Iniesta, CM, 89
    Xavi Hernández, CM, 86, Xavi
    Rafinha, CM/W, 77
    Sergi Roberto, CM/FB, 74
    Pedro, W, 81
    Neymar, W/ST, 86
    Munir El Haddadi, W/ST, 71, Munir
    Lionel Messi, W/ST, 93
    Luis Suárez, ST, 89
  `),
  pool('Barcelona', 'BAR', '2017/18', BARCA, '4-4-2', `
    Marc-André ter Stegen, GK, 87
    Jasper Cillessen, GK, 80
    Gerard Piqué, CB, 87
    Samuel Umtiti, CB, 84
    Thomas Vermaelen, CB, 78
    Yerry Mina, CB, 76
    Jordi Alba, FB, 85
    Nélson Semedo, FB, 79
    Sergi Roberto, FB/CM, 81
    Lucas Digne, FB, 79
    Aleix Vidal, FB/WM, 76
    Sergio Busquets, DM, 87
    Ivan Rakitić, CM/DM, 86
    Andrés Iniesta, CM/WM, 87
    Paulinho, CM, 81
    André Gomes, CM, 79, André Gomes
    Denis Suárez, CM/WM, 78
    Philippe Coutinho, CM/WM/W, 87
    Ousmane Dembélé, W/WM, 83
    Gerard Deulofeu, W, 78
    Lionel Messi, ST/W, 94
    Luis Suárez, ST, 92
    Paco Alcácer, ST, 79
  `),
  pool('Barcelona', 'BAR', '2022/23', BARCA, '4-3-3', `
    Marc-André ter Stegen, GK, 88
    Iñaki Peña, GK, 72
    Ronald Araújo, CB/FB, 86
    Jules Koundé, CB/FB, 85
    Andreas Christensen, CB, 82
    Eric García, CB, 77
    Marcos Alonso, FB/CB, 80
    Alejandro Balde, FB, 76
    Jordi Alba, FB, 84
    Sergi Roberto, FB/CM, 79
    Héctor Bellerín, FB, 78
    Sergio Busquets, DM, 86
    Frenkie de Jong, CM/DM, 87
    Pedri, CM, 86
    Gavi, CM, 79
    Franck Kessié, CM/DM, 82
    Pablo Torre, CM, 68
    Ousmane Dembélé, W, 86
    Raphinha, W, 84
    Ferran Torres, W/ST, 81
    Ansu Fati, W/ST, 79
    Robert Lewandowski, ST, 91
  `),
  pool('Barcelona', 'BAR', '2024/25', BARCA, '4-2-3-1', `
    Marc-André ter Stegen, GK, 89
    Wojciech Szczęsny, GK, 82
    Iñaki Peña, GK, 76
    Pau Cubarsí, CB, 80
    Iñigo Martínez, CB, 82
    Ronald Araújo, CB, 85
    Andreas Christensen, CB/DM, 82
    Eric García, CB/FB, 77
    Jules Koundé, FB/CB, 86
    Alejandro Balde, FB, 81
    Gerard Martín, FB, 70
    Marc Casadó, DM, 77
    Frenkie de Jong, CM/DM, 85
    Marc Bernal, DM, 70
    Pedri, CM, 87
    Gavi, CM, 81
    Dani Olmo, CM/W, 85
    Fermín López, CM, 78
    Lamine Yamal, W, 81
    Raphinha, W, 87
    Ferran Torres, ST/W, 79
    Robert Lewandowski, ST, 88
    Pau Víctor, ST, 69
  `),
  pool('Atlético Madrid', 'ATM', '2013/14', ATLETI, '4-4-2', `
    Thibaut Courtois, GK, 85
    Daniel Aranzubía, GK, 73
    Diego Godín, CB, 85
    Miranda, CB, 83
    Toby Alderweireld, CB, 78
    Juanfran, FB, 82
    Filipe Luís, FB, 83
    Emiliano Insúa, FB, 74
    Gabi, DM, 82
    Mario Suárez, DM, 80
    Tiago Mendes, DM, 81, Tiago
    Koke, CM/WM, 82
    Raúl García, CM/ST, 79
    Arda Turan, WM/CM, 84
    Diego Ribas, CM, 80, Diego
    Óliver Torres, CM, 72
    Saúl Ñíguez, CM, 70, Saúl
    Cristian Rodríguez, WM, 76
    Adrián López, ST/W, 77, Adrián López
    Léo Baptistão, ST/W, 73
    Diego Costa, ST, 83, Diego Costa
    David Villa, ST, 83
  `),
  pool('Atlético Madrid', 'ATM', '2015/16', ATLETI, '4-4-2', `
    Jan Oblak, GK, 84
    Miguel Ángel Moyá, GK, 78, Moyá
    Diego Godín, CB, 87
    Stefan Savić, CB, 81
    José María Giménez, CB, 80
    Lucas Hernández, CB/FB, 72
    Juanfran, FB, 84
    Filipe Luís, FB, 84
    Gabi, DM, 83
    Tiago Mendes, DM, 82, Tiago
    Augusto Fernández, DM, 78
    Thomas Partey, DM, 70
    Koke, CM/WM, 85
    Saúl Ñíguez, CM/WM, 79, Saúl
    Óliver Torres, CM, 76
    Yannick Carrasco, WM/W, 79
    Ángel Correa, WM/ST, 74
    Antoine Griezmann, ST/W, 85
    Fernando Torres, ST, 80
    Jackson Martínez, ST, 82
    Luciano Vietto, ST, 77
  `),
  pool('Atlético Madrid', 'ATM', '2017/18', ATLETI, '4-4-2', `
    Jan Oblak, GK, 88
    Axel Werner, GK, 68
    Diego Godín, CB, 88
    José María Giménez, CB, 83
    Stefan Savić, CB, 82
    Lucas Hernández, CB/FB, 80
    Juanfran, FB, 83
    Filipe Luís, FB, 84
    Šime Vrsaljko, FB, 80
    Gabi, DM, 83
    Thomas Partey, DM/CM, 78
    Koke, CM/WM, 86
    Saúl Ñíguez, CM/WM, 85, Saúl
    Yannick Carrasco, WM/W, 83
    Vitolo, WM/W, 81
    Nicolás Gaitán, WM/CM, 80
    Ángel Correa, WM/ST, 79
    Antoine Griezmann, ST, 88
    Diego Costa, ST, 85, Diego Costa
    Kevin Gameiro, ST, 81
    Fernando Torres, ST, 78
  `),
  pool('Atlético Madrid', 'ATM', '2020/21', ATLETI, '3-5-2', `
    Jan Oblak, GK, 91
    Ivo Grbić, GK, 70
    José María Giménez, CB, 84
    Stefan Savić, CB, 83
    Felipe, CB, 82
    Mario Hermoso, CB/FB, 80
    Kieran Trippier, FB, 84
    Šime Vrsaljko, FB, 77
    Renan Lodi, FB, 79
    Yannick Carrasco, WM/W/FB, 83
    Geoffrey Kondogbia, DM, 79
    Lucas Torreira, DM, 79
    Koke, CM/DM, 86
    Saúl Ñíguez, CM/FB, 84, Saúl
    Marcos Llorente, CM/WM/ST, 85
    Héctor Herrera, CM, 80
    João Félix, ST/W, 84
    Ángel Correa, ST/WM, 82
    Luis Suárez, ST, 87
    Moussa Dembélé, ST, 77
  `),
  pool('Sevilla', 'SEV', '2015/16', SEVILLA, '4-2-3-1', `
    Sergio Rico, GK, 79
    David Soria, GK, 70
    Beto, GK, 76
    Daniel Carriço, CB, 79
    Adil Rami, CB, 81
    Timothée Kolodziejczak, CB/FB, 77
    Sebastián Cristóforo, DM, 72
    Mariano Ferreira, FB, 77, Mariano
    Benoît Trémoulinas, FB, 78
    Coke, FB/WM, 78
    Sergio Escudero, FB, 76
    Grzegorz Krychowiak, DM, 82
    Steven N’Zonzi, DM, 81
    Vicente Iborra, CM/DM, 79
    Éver Banega, CM, 83
    Michael Krohn-Dehli, CM/W, 77
    Yevhen Konoplyanka, W, 80
    Vitolo, W, 81
    José Antonio Reyes, W, 78
    Kevin Gameiro, ST, 82
    Fernando Llorente, ST, 79
  `),
  pool('Sevilla', 'SEV', '2019/20', SEVILLA, '4-3-3', `
    Yassine Bounou, GK, 80, Bono
    Tomáš Vaclík, GK, 80
    Jules Koundé, CB, 77
    Diego Carlos, CB, 82, Diego Carlos
    Sergi Gómez, CB, 75
    Jesús Navas, FB/WM, 83, Navas
    Sergio Reguilón, FB, 79
    Sergio Escudero, FB, 77
    Fernando, DM, 81
    Nemanja Gudelj, DM/CB, 78
    Joan Jordán, CM, 79
    Éver Banega, CM, 84
    Óliver Torres, CM, 80
    Franco Vázquez, CM/W, 81
    Lucas Ocampos, W, 82
    Suso, W, 81
    Nolito, W, 79
    Munir El Haddadi, W/ST, 78, Munir
    Bryan Gil, W, 71
    Luuk de Jong, ST, 80
    Youssef En-Nesyri, ST, 78
  `),
  pool('Valencia', 'VAL', '2011/12', VALENCIA, '4-2-3-1', `
    Diego Alves, GK, 81
    Vicente Guaita, GK, 76
    Víctor Ruiz, CB, 76
    Adil Rami, CB, 81
    David Navarro, CB, 75
    Ricardo Costa, CB/FB, 77
    Jérémy Mathieu, FB/CB, 79
    Antonio Barragán, FB, 75
    Bruno Saltor, FB, 74
    Jordi Alba, FB/WM, 78
    David Albelda, DM, 75
    Éver Banega, CM, 79
    Dani Parejo, CM, 78
    Tino Costa, CM, 79
    Sergio Canales, CM, 77
    Pablo Hernández, WM/W, 80
    Sofiane Feghouli, WM/W, 77
    Pablo Piatti, WM/W, 77
    Jonas, ST/CM, 81
    Roberto Soldado, ST, 83
    Aritz Aduriz, ST, 79
  `),
  pool('Valencia', 'VAL', '2018/19', VALENCIA, '4-4-2', `
    Neto, GK, 81
    Jaume Doménech, GK, 75
    Gabriel Paulista, CB, 80, Gabriel Paulista
    Ezequiel Garay, CB, 81
    Mouctar Diakhaby, CB, 77
    Jeison Murillo, CB, 77
    Cristiano Piccini, FB, 79
    José Luis Gayà, FB, 83, Gayà
    Toni Lato, FB, 72
    Daniel Wass, WM/FB, 78
    Dani Parejo, CM, 86
    Geoffrey Kondogbia, DM/CM, 82
    Francis Coquelin, DM, 79
    Carlos Soler, CM/WM, 79
    Gonçalo Guedes, WM/ST, 81
    Denis Cheryshev, WM, 78
    Ferran Torres, WM, 72
    Rodrigo, ST, 82
    Kevin Gameiro, ST, 80
    Santi Mina, ST, 77
    Michy Batshuayi, ST, 80
  `),
  pool('Villarreal', 'VIL', '2010/11', YELLOW, '4-4-2', `
    Diego López, GK, 82
    Juan Carlos, GK, 68
    Gonzalo Rodríguez, CB, 80
    Carlos Marchena, CB/DM, 79
    Mateo Musacchio, CB, 72
    Ángel López, FB, 75
    Joan Capdevila, FB, 80
    Mario Gaspar, FB, 68
    Bruno Soriano, DM, 81
    Marcos Senna, DM, 80
    Borja Valero, CM, 82
    Javier Matilla, CM, 70
    Jonathan de Guzmán, CM, 74
    Ariel Ibagaza, CM, 77
    Santi Cazorla, WM/CM, 85
    Cani, WM/CM, 80
    Nilmar, ST/W, 82
    Giuseppe Rossi, ST, 85
    Marco Ruben, ST, 74
  `),
  pool('Villarreal', 'VIL', '2020/21', YELLOW, '4-4-2', `
    Gerónimo Rulli, GK, 79
    Sergio Asenjo, GK, 79
    Raúl Albiol, CB, 82
    Pau Torres, CB, 82
    Juan Foyth, CB/FB, 77
    Alfonso Pedraza, FB, 77
    Pervis Estupiñán, FB, 77
    Alberto Moreno, FB, 76
    Mario Gaspar, FB, 76
    Étienne Capoue, DM, 83
    Francis Coquelin, DM/CM, 79
    Vicente Iborra, DM/CM, 79
    Dani Parejo, CM, 85
    Manu Trigueros, CM/WM, 79
    Moi Gómez, WM/CM, 76
    Samuel Chukwueze, WM/W, 79
    Yeremy Pino, WM/W, 72
    Takefusa Kubo, WM/CM, 77
    Gerard Moreno, ST, 84
    Paco Alcácer, ST, 80
    Carlos Bacca, ST, 79
    Fer Niño, ST, 66
  `),
  pool('Real Sociedad', 'RSO', '2013/14', REAL_SOCIEDAD, '4-3-3', `
    Claudio Bravo, GK, 82
    Eñaut Zubikarai, GK, 72
    Iñigo Martínez, CB, 80
    Mikel González, CB, 76
    Ion Ansotegi, CB, 72
    Carlos Martínez, FB, 76
    Alberto de la Bella, FB, 77
    Dani Estrada, FB, 72
    Markel Bergara, DM, 77
    Gorka Elustondo, DM/CB, 72
    Xabi Prieto, CM/W, 80
    David Zurutuza, CM, 77
    Esteban Granero, CM, 78
    Rubén Pardo, CM, 74
    Sergio Canales, CM/W, 77
    Antoine Griezmann, W/ST, 80
    Carlos Vela, W/ST, 82
    Chori Castro, W, 76
    Imanol Agirretxe, ST, 77
    Haris Seferović, ST, 74
  `),
  pool('Real Sociedad', 'RSO', '2022/23', REAL_SOCIEDAD, '4-3-3', `
    Álex Remiro, GK, 81
    Unai Marrero, GK, 66
    Robin Le Normand, CB, 81
    Igor Zubeldia, CB/DM, 78
    Aritz Elustondo, CB, 76
    Jon Pacheco, CB, 74
    Andoni Gorosabel, FB, 76
    Aihen Muñoz, FB, 75
    Diego Rico, FB, 75
    Álex Sola, FB/WM, 70
    Martín Zubimendi, DM, 82
    Asier Illarramendi, DM, 76
    Mikel Merino, CM, 83
    Brais Méndez, CM, 81
    David Silva, CM, 84
    Beñat Turrientes, CM, 72
    Takefusa Kubo, W/CM, 80
    Ander Barrenetxea, W, 77
    Mikel Oyarzabal, W/ST, 82
    Alexander Sørloth, ST, 79
    Umar Sadiq, ST, 77
    Carlos Fernández, ST, 74
  `),
  pool('Athletic Club', 'ATH', '2011/12', ATHLETIC, '4-3-3', `
    Gorka Iraizoz, GK, 80
    Raúl Fernández, GK, 70
    Javi Martínez, CB/DM, 82
    Fernando Amorebieta, CB, 79
    Mikel San José, CB/DM, 75
    Borja Ekiza, CB, 72
    Andoni Iraola, FB, 81
    Jon Aurtenetxe, FB, 72
    Ander Iturraspe, DM, 75
    Carlos Gurpegui, DM, 76
    Ander Herrera, CM, 80
    Óscar de Marcos, CM/WM/FB, 78
    Iñigo Pérez, CM, 72
    Iker Muniain, W, 80
    Markel Susaeta, W, 79
    Ibai Gómez, W, 74
    Igor Gabilondo, W, 74
    Gaizka Toquero, ST/W, 77
    Fernando Llorente, ST, 84
  `),
  pool('Athletic Club', 'ATH', '2023/24', ATHLETIC, '4-2-3-1', `
    Unai Simón, GK, 85
    Julen Agirrezabala, GK, 74
    Dani Vivian, CB, 80
    Yeray Álvarez, CB, 80
    Aitor Paredes, CB, 76
    Iñigo Lekue, FB, 75
    Óscar de Marcos, FB, 79
    Yuri Berchiche, FB, 79
    Imanol García de Albéniz, FB, 72
    Íñigo Ruiz de Galarreta, DM, 79
    Mikel Vesga, DM, 77
    Beñat Prados, DM, 72
    Ander Herrera, CM, 78
    Oihan Sancet, CM, 81
    Unai Gómez, CM/W, 72
    Iker Muniain, CM/W, 78
    Nico Williams, W, 82
    Iñaki Williams, W/ST, 82
    Álex Berenguer, W/ST, 79
    Gorka Guruzeta, ST, 78
    Asier Villalibre, ST, 74
  `),
  pool('Real Betis', 'BET', '2017/18', BETIS, '3-5-2', `
    Antonio Adán, GK, 80
    Pau López, GK, 79
    Marc Bartra, CB, 81
    Zou Feddal, CB, 77
    Aïssa Mandi, CB/FB, 79
    Jordi Amat, CB, 76
    Antonio Barragán, FB, 76
    Riza Durmisi, FB, 76
    Júnior Firpo, FB, 72
    Javi García, DM/CB, 79, Javi García
    Andrés Guardado, CM/WM, 82
    Fabián Ruiz, CM, 75
    Víctor Camarasa, CM, 77
    Giovani Lo Celso, CM, 81
    Ryad Boudebouz, CM/W, 80
    Joaquín, WM/W, 81
    Cristian Tello, WM/W, 79
    Sergio León, ST, 78
    Loren Morón, ST, 74
    Antonio Sanabria, ST, 77
  `),
  pool('Real Betis', 'BET', '2021/22', BETIS, '4-2-3-1', `
    Claudio Bravo, GK, 79
    Rui Silva, GK, 79
    Germán Pezzella, CB, 81
    Marc Bartra, CB, 79
    Édgar González, CB, 72
    Víctor Ruiz, CB, 77
    Héctor Bellerín, FB, 79
    Youssouf Sabaly, FB, 76
    Álex Moreno, FB, 80
    Juan Miranda, FB, 74
    Guido Rodríguez, DM, 82
    William Carvalho, DM/CM, 80
    Andrés Guardado, DM/CM, 79
    Sergio Canales, CM, 83
    Nabil Fekir, CM/W, 85
    Joaquín, W, 79
    Juanmi, W/ST, 78
    Aitor Ruibal, W/FB, 75
    Cristian Tello, W, 76
    Diego Lainez, W, 73
    Borja Iglesias, ST, 81
    Willian José, ST, 79
  `),
  pool('Málaga', 'MAL', '2012/13', SKY, '4-2-3-1', `
    Willy Caballero, GK, 78
    Carlos Kameni, GK, 75
    Martín Demichelis, CB, 79
    Weligton, CB, 76
    Sergio Sánchez, CB, 74
    Oguchi Onyewu, CB, 73
    Jesús Gámez, FB, 75
    Nacho Monreal, FB, 78
    Vitorino Antunes, FB, 72
    Jérémy Toulalan, DM, 81
    Ignacio Camacho, DM, 77
    Manuel Iturra, DM, 75
    Isco, CM/W, 80
    Duda, CM/W, 75
    Pedro Morales, CM, 73
    Francisco Portillo, CM/W, 72, Portillo
    Joaquín, W, 80
    Eliseu, W/FB, 75
    Sebastián Fernández, W/ST, 74
    Javier Saviola, ST, 79
    Roque Santa Cruz, ST, 76
    Júlio Baptista, ST/CM, 76
  `),
  pool('Getafe', 'GET', '2018/19', ROYAL, '4-4-2', `
    David Soria, GK, 79
    Rubén Yáñez, GK, 70
    Dakonam Djené, CB, 77, Djené
    Leandro Cabrera, CB, 76
    Bruno González, CB, 74
    Erick Cabaco, CB, 72
    Damián Suárez, FB, 76
    Vitorino Antunes, FB, 74
    Mathías Olivera, FB, 70
    Nemanja Maksimović, CM/DM, 76
    Mauro Arambarri, DM, 76
    Markel Bergara, DM, 73
    Fayçal Fajr, CM/WM, 74
    Francisco Portillo, WM, 75, Portillo
    Amath Ndiaye, WM/ST, 70
    Jason Remeseiro, WM, 72, Jason
    Robert Ibáñez, WM, 71
    Jaime Mata, ST, 77
    Jorge Molina, ST, 76
    Ángel Rodríguez, ST, 75, Ángel
    Hugo Duro, ST, 64
  `),
  pool('Celta Vigo', 'CEL', '2016/17', SKY, '4-3-3', `
    Sergio Álvarez, GK, 77
    Rubén Blanco, GK, 72
    Gustavo Cabral, CB, 76
    Sergi Gómez, CB, 74
    Facundo Roncaglia, CB/FB, 76
    Andreu Fontàs, CB, 74
    Hugo Mallo, FB, 78
    Jonny, FB, 74
    Carles Planas, FB, 72
    Nemanja Radoja, DM, 75
    Marcelo Díaz, DM, 78
    Daniel Wass, CM/FB, 77
    Jozabed Sánchez, CM, 74, Jozabed
    Andrew Hjulsager, CM, 70
    Pione Sisto, W, 75
    Theo Bongonda, W, 72
    Iago Aspas, ST/W, 82
    John Guidetti, ST, 75
    Claudio Beauvue, ST, 73
  `),
  pool('Espanyol', 'ESP', '2018/19', ESPANYOL, '4-3-3', `
    Diego López, GK, 80
    Andrés Prieto, GK, 68
    Mario Hermoso, CB, 78
    David López, CB/DM, 77
    Óscar Duarte, CB, 75
    Javi López, FB, 75
    Dídac Vilà, FB, 73
    Adrià Pedrosa, FB, 72
    Víctor Sánchez, DM/FB, 76
    Marc Roca, DM, 76
    Esteban Granero, CM, 76
    Sergi Darder, CM, 77
    Pol Lozano, CM, 66
    Óscar Melendo, CM/W, 75
    Pablo Piatti, W, 75
    Hernán Pérez, W, 74
    Léo Baptistão, W/ST, 75
    Wu Lei, W/ST, 72, Wu Lei
    Borja Iglesias, ST, 78
    Sergio García, ST/W, 77
    Facundo Ferreyra, ST, 73
  `),
  pool('Girona', 'GIR', '2023/24', GIRONA, '4-3-3', `
    Paulo Gazzaniga, GK, 78
    Juan Carlos, GK, 72
    Eric García, CB, 78
    David López, CB, 76
    Daley Blind, CB/FB, 79
    Juanpe, CB, 74
    Yan Couto, FB, 78
    Miguel Gutiérrez, FB, 79
    Arnau Martínez, FB/CB, 76
    Aleix García, DM, 82
    Yangel Herrera, CM/DM, 79
    Iván Martín, CM, 79
    Pablo Torre, CM, 72
    Jhon Solís, DM, 70
    Viktor Tsygankov, W, 80
    Savinho, W, 78
    Bryan Gil, W, 74
    Valery Fernández, W/CM, 73
    Portu, W/ST, 75
    Artem Dovbyk, ST, 81
    Cristhian Stuani, ST, 78
  `),
  pool('Deportivo La Coruña', 'DEP', '2016/17', DEPOR, '4-2-3-1', `
    Przemysław Tytoń, GK, 76
    Germán Lux, GK, 72
    Sidnei, CB, 76
    Alejandro Arribas, CB, 75
    Raúl Albentosa, CB, 73
    Laure, FB, 72
    Fernando Navarro, FB, 74
    Luisinho, FB, 73
    Guilherme, DM, 74
    Pedro Mosquera, DM, 73
    Celso Borges, DM/CM, 75
    Álex Bergantiños, DM, 72
    Emre Çolak, CM/W, 76
    Fayçal Fajr, CM, 74
    Carles Gil, CM/W, 75
    Bruno Gama, W, 73
    Fede Cartabia, W, 75
    Gaël Kakuta, W/CM, 74
    Ryan Babel, W/ST, 75
    Joselu, ST, 74
    Florin Andone, ST, 75
  `),
  pool('Osasuna', 'OSA', '2022/23', OSASUNA, '4-3-3', `
    Sergio Herrera, GK, 77
    Aitor Fernández, GK, 75
    David García, CB, 78
    Aridane Hernández, CB, 75
    Unai García, CB, 73
    Juan Cruz, CB/FB, 74
    Nacho Vidal, FB, 75
    Manu Sánchez, FB, 74
    Rubén Peña, FB/WM, 73
    Lucas Torró, DM, 76
    Jon Moncayola, CM, 77
    Aimar Oroz, CM, 75
    Darko Brašanac, CM, 74
    Pablo Ibáñez, CM, 72
    Moi Gómez, W/CM, 77
    Kike Barja, W, 74
    Abde Ezzalzouli, W, 76, Abde
    Rubén García, W, 77
    Ezequiel Ávila, ST, 77, Chimy
    Ante Budimir, ST, 77
    Kike García, ST, 75
  `),
  pool('Rayo Vallecano', 'RAY', '2021/22', RAYO, '4-4-2', `
    Stole Dimitrievski, GK, 76
    Luca Zidane, GK, 70
    Alejandro Catena, CB, 75
    Abdul Mumin, CB, 73
    Esteban Saveljich, CB, 72
    Mario Suárez, CB/DM, 74
    Iván Balliu, FB, 74
    Fran García, FB, 75
    Óscar Valentín, DM, 76
    Pathé Ciss, DM, 73
    Santi Comesaña, CM, 75
    Unai López, CM, 75
    Óscar Trejo, CM/ST, 77
    Isi Palazón, WM, 76, Isi
    Álvaro García, WM, 77
    Andrés Martín, WM, 72
    Bebé, WM/ST, 72
    Randy Nteka, ST, 71
    Radamel Falcao, ST, 79
    Sergi Guardiola, ST, 74
  `),
  pool('Levante', 'LEV', '2020/21', LEVANTE, '4-4-2', `
    Aitor Fernández, GK, 78
    Dani Cárdenas, GK, 72
    Rúben Vezo, CB, 76
    Óscar Duarte, CB, 75
    Sergio Postigo, CB, 74
    Róber Pier, CB, 73
    Jorge Miramón, FB, 74
    Carlos Clerc, FB, 73
    Coke, FB/CB, 75
    Nemanja Radoja, DM, 76
    Pepelu, DM, 72
    Mickaël Malsa, DM, 73
    Gonzalo Melero, CM, 75
    José Campaña, CM, 78
    Enis Bardhi, CM/WM, 78
    Jorge de Frutos, WM, 74
    Rubén Rochina, WM/CM, 75
    José Luis Morales, ST/WM, 79
    Roger Martí, ST, 77
    Sergio León, ST, 74
    Dani Gómez, ST, 70
  `),
  pool('Eibar', 'EIB', '2016/17', EIBAR, '4-4-2', `
    Yoel Rodríguez, GK, 75, Yoel
    Asier Riesgo, GK, 74
    Iván Ramis, CB, 74
    Florian Lejeune, CB, 76
    Alejandro Gálvez, CB, 74
    Mauro dos Santos, CB, 72
    Anaitz Arbilla, CB/FB, 72
    Ander Capa, FB, 75
    David Juncà, FB, 74
    Antonio Luna, FB, 72
    Dani García, DM, 77
    Gonzalo Escalante, CM, 75
    Adrián González, CM, 73
    Fran Rico, CM, 72
    Takashi Inui, WM, 77
    Pedro León, WM, 77
    Rubén Peña, WM/FB, 72
    Sergi Enrich, ST, 75
    Kike García, ST, 74
  `),
  pool('Granada', 'GRA', '2019/20', GRANADA, '4-4-2', `
    Rui Silva, GK, 77
    Aarón Escandell, GK, 70
    Domingos Duarte, CB, 76
    Germán Sánchez, CB, 75
    Víctor Díaz, FB/CB, 75
    Dimitri Foulquier, FB, 74
    Carlos Neva, FB, 72
    Quini, FB, 70
    Maxime Gonalons, DM, 77
    Yan Eteki, DM, 74
    Yangel Herrera, CM, 77
    Ángel Montoro, CM, 75
    Ramón Azeez, CM, 70
    Antonio Puertas, WM, 76
    Darwin Machís, WM, 76
    Fede Vico, WM/CM, 72
    Álvaro Vadillo, WM, 73
    Roberto Soldado, ST, 77
    Carlos Fernández, ST, 74
  `),
  pool('Las Palmas', 'LPA', '2015/16', LAS_PALMAS, '4-3-3', `
    Javi Varas, GK, 74
    Raúl Lizoain, GK, 70
    David García Santana, CB, 72, David García
    Pedro Bigas, CB, 73
    Aythami Artiles, CB, 72
    Mauricio Lemos, CB, 70
    David Simón, FB, 73
    Dani Castellano, FB, 72
    Michel Macedo, FB, 70
    Vicente Gómez, DM, 73
    Roque Mesa, CM/DM, 76
    Javi Castellano, CM, 71
    Hernán Santana, CM, 70
    Jonathan Viera, CM/W, 78
    Momo, W, 72
    Tana, W, 73
    Nabil El Zhar, W, 73
    Sergio Araujo, ST, 76
    Willian José, ST, 76
  `),
  pool('Real Valladolid', 'VLL', '2019/20', VALLADOLID, '4-4-2', `
    Jordi Masip, GK, 77
    José Antonio Caro, GK, 68
    Kiko Olivas, CB, 73
    Joaquín Fernández, CB, 74
    Mohammed Salisu, CB, 74
    Javi Sánchez, CB, 73
    Javi Moyano, FB, 73
    Pedro Porro, FB/WM, 72
    Nacho Martínez, FB, 74
    Michel Herrero, CM, 73
    Rubén Alcaraz, CM/DM, 75
    Fede San Emeterio, DM, 74
    Kike Pérez, CM, 72
    Óscar Plano, WM/ST, 74
    Toni Villa, WM, 73
    Pablo Hervías, WM, 72
    Waldo Rubio, WM/ST, 70
    Sergi Guardiola, ST, 74
    Enes Ünal, ST, 75
  `),
  pool('Mallorca', 'MLL', '2023/24', MALLORCA, '3-5-2', `
    Predrag Rajković, GK, 78
    Dominik Greif, GK, 73
    Martin Valjent, CB, 77
    Antonio Raíllo, CB, 77
    José Copete, CB, 74
    Siebe Van der Heyden, CB, 73
    Pablo Maffeo, FB, 77
    Jaume Costa, FB, 74
    Toni Lato, FB, 73
    Giovanni González, FB/CB, 72
    Samú Costa, DM, 76
    Omar Mascarell, DM, 74
    Iddrisu Baba, DM, 72
    Sergi Darder, CM, 78
    Manu Morlanes, CM, 74
    Antonio Sánchez, CM/WM, 73
    Dani Rodríguez, CM/WM, 75
    Takuma Asano, ST/W, 74
    Vedat Muriqi, ST, 78
    Abdón Prats, ST, 72
    Cyle Larin, ST, 74
  `),
].map((p) => ({ ...p, league: 'La Liga' as const }))

/** Left-footed players in these squads (not already in pools.ts). */
export const LEFT_FOOTED: string[] = [
  'Marcelo', 'Fábio Coentrão', 'Ángel Di María', 'David Alaba', 'Ferland Mendy', 'Fran García',
  'Eduardo Camavinga', 'Arda Güler', 'Marco Asensio', 'Lionel Messi', 'Eric Abidal', 'Maxwell',
  'Adriano Correia', 'Jordi Alba', 'Jérémy Mathieu', 'Thomas Vermaelen', 'Andreu Fontàs',
  'Alejandro Balde', 'Iñigo Martínez', 'Gerard Martín', 'Lamine Yamal', 'Lucas Hernández',
  'Mario Hermoso', 'Renan Lodi', 'Antoine Griezmann', 'Saúl Ñíguez', 'Cristian Rodríguez',
  'Emiliano Insúa', 'Nicolás Gaitán', 'Benoît Trémoulinas', 'Sergio Escudero',
  'Timothée Kolodziejczak', 'José Antonio Reyes', 'Franco Vázquez', 'Suso', 'Nolito', 'Bryan Gil',
  'Tino Costa', 'Sergio Canales', 'José Luis Gayà', 'Toni Lato', 'Denis Cheryshev',
  'Mouctar Diakhaby', 'Joan Capdevila', 'Giuseppe Rossi', 'Alfonso Pedraza', 'Samuel Chukwueze',
  'Takefusa Kubo', 'Carlos Vela', 'Alberto de la Bella', 'Haris Seferović', 'Aihen Muñoz',
  'Diego Rico', 'Mikel Oyarzabal', 'Brais Méndez', 'Jon Pacheco', 'Fernando Amorebieta',
  'Jon Aurtenetxe', 'Iker Muniain', 'Ibai Gómez', 'Igor Gabilondo', 'Yuri Berchiche',
  'Imanol García de Albéniz', 'Riza Durmisi', 'Júnior Firpo', 'Andrés Guardado', 'Fabián Ruiz',
  'Ryad Boudebouz', 'Zou Feddal', 'Juan Miranda', 'Nabil Fekir', 'Diego Lainez', 'Eliseu',
  'Vitorino Antunes', 'Duda', 'Mathías Olivera', 'Leandro Cabrera', 'Carles Planas', 'Pione Sisto',
  'Iago Aspas', 'Dídac Vilà', 'Adrià Pedrosa', 'Daley Blind', 'Miguel Gutiérrez',
  'Viktor Tsygankov', 'Savinho', 'Fernando Navarro', 'Luisinho', 'Fede Cartabia', 'Carles Gil',
  'Manu Sánchez', 'Juan Cruz', 'Álvaro García', 'Bebé', 'Carlos Clerc', 'José Campaña',
  'Rubén Rochina', 'David Juncà', 'Antonio Luna', 'Carlos Neva', 'Pedro Bigas', 'Dani Castellano',
  'Nacho Martínez', 'Mohammed Salisu', 'Jaume Costa', 'Mikel Merino',
]

/** Weak foot where it isn't 3 stars (not already in pools.ts). */
export const WEAK_FOOT: Record<string, number> = {
  'Neymar': 5, 'Ousmane Dembélé': 5, 'Toni Kroos': 5, 'Lionel Messi': 4,
  'Andrés Iniesta': 4, 'Xavi Hernández': 4, 'Isco': 4, 'Dani Olmo': 4, 'Karim Benzema': 4,
  'Vinícius Júnior': 4, 'Rodrygo': 4, 'Jude Bellingham': 4, 'Pedri': 4, 'Ivan Rakitić': 4,
  'Arda Turan': 4, 'Koke': 4, 'Robert Lewandowski': 4, 'Joaquín': 4, 'Kaká': 4, 'Dani Parejo': 4,
  'Ángel Di María': 2, 'Marcelo': 2, 'Takefusa Kubo': 2, 'Arda Güler': 2, 'Nabil Fekir': 2,
}

/** Archetypes of the best-known players (not already in pools.ts). */
export const ARCHETYPE: Record<string, Archetype> = {
  'Iker Casillas': 'shotStopper', 'Keylor Navas': 'shotStopper', 'Jan Oblak': 'shotStopper',
  'Marc-André ter Stegen': 'sweeperKeeper', 'Víctor Valdés': 'sweeperKeeper',
  'Unai Simón': 'sweeperKeeper', 'Yassine Bounou': 'shotStopper', 'Diego Alves': 'shotStopper',
  'Sergio Ramos': 'ballPlayer', 'Pepe': 'stopper', 'Gerard Piqué': 'ballPlayer',
  'Carles Puyol': 'stopper', 'Diego Godín': 'stopper', 'José María Giménez': 'stopper',
  'Ronald Araújo': 'stopper', 'Éder Militão': 'stopper', 'David Alaba': 'ballPlayer',
  'Pau Cubarsí': 'ballPlayer', 'Jules Koundé': 'stopper', 'Samuel Umtiti': 'ballPlayer',
  'Javier Mascherano': 'stopper', 'Iñigo Martínez': 'ballPlayer', 'Ezequiel Garay': 'stopper',
  'Mario Hermoso': 'ballPlayer', 'Robin Le Normand': 'stopper', 'Miranda': 'stopper',
  'Daley Blind': 'ballPlayer', 'Javi Martínez': 'stopper',
  'Marcelo': 'overlapping', 'Dani Alves': 'overlapping', 'Jordi Alba': 'overlapping',
  'Dani Carvajal': 'overlapping', 'Juanfran': 'overlapping', 'José Luis Gayà': 'overlapping',
  'Ferland Mendy': 'defensiveFullBack', 'Alejandro Balde': 'overlapping',
  'Fábio Coentrão': 'overlapping', 'Álvaro Arbeloa': 'defensiveFullBack',
  'Eric Abidal': 'defensiveFullBack', 'Andoni Iraola': 'overlapping', 'Renan Lodi': 'overlapping',
  'Yuri Berchiche': 'overlapping',
  'Sergio Busquets': 'deepPlaymaker', 'Xabi Alonso': 'deepPlaymaker', 'Gabi': 'ballWinner',
  'Martín Zubimendi': 'deepPlaymaker', 'Aurélien Tchouaméni': 'anchor',
  'Grzegorz Krychowiak': 'ballWinner', 'Steven N’Zonzi': 'anchor', 'Geoffrey Kondogbia': 'ballWinner',
  'Guido Rodríguez': 'anchor', 'Tiago Mendes': 'anchor', 'Fernando': 'anchor',
  'Bruno Soriano': 'anchor', 'Aleix García': 'deepPlaymaker',
  'Xavi Hernández': 'playmaker', 'Andrés Iniesta': 'playmaker', 'Toni Kroos': 'playmaker',
  'Isco': 'playmaker', 'Koke': 'playmaker', 'Saúl Ñíguez': 'boxToBox', 'Ivan Rakitić': 'boxToBox',
  'Pedri': 'playmaker', 'Gavi': 'ballWinner', 'Frenkie de Jong': 'playmaker',
  'Federico Valverde': 'boxToBox', 'Jude Bellingham': 'boxToBox', 'Dani Parejo': 'playmaker',
  'Éver Banega': 'playmaker', 'Marcos Llorente': 'boxToBox', 'Kaká': 'playmaker',
  'Eduardo Camavinga': 'boxToBox', 'Nabil Fekir': 'playmaker', 'Sergio Canales': 'playmaker',
  'Dani Olmo': 'playmaker', 'Paulinho': 'boxToBox', 'Brais Méndez': 'playmaker',
  'Oihan Sancet': 'playmaker', 'Xabi Prieto': 'playmaker', 'Borja Valero': 'playmaker',
  'Andrés Guardado': 'playmaker', 'Sami Khedira': 'boxToBox',
  'Ángel Di María': 'winger', 'Neymar': 'insideForward', 'Vinícius Júnior': 'insideForward',
  'Lamine Yamal': 'insideForward', 'Ousmane Dembélé': 'winger', 'Rodrygo': 'winger',
  'Carlos Vela': 'insideForward', 'Iker Muniain': 'winger', 'Nico Williams': 'winger',
  'Iñaki Williams': 'winger', 'Joaquín': 'winger', 'Lucas Ocampos': 'winger', 'Suso': 'insideForward',
  'Yannick Carrasco': 'insideForward', 'Samuel Chukwueze': 'insideForward',
  'Viktor Tsygankov': 'insideForward', 'Savinho': 'insideForward', 'Marco Asensio': 'insideForward',
  'Arda Turan': 'insideForward', 'Lucas Vázquez': 'winger', 'Ferran Torres': 'winger',
  'Karim Benzema': 'falseNine', 'Gonzalo Higuaín': 'poacher', 'David Villa': 'poacher',
  'Fernando Llorente': 'targetMan', 'Robert Lewandowski': 'poacher', 'Gerard Moreno': 'poacher',
  'Iago Aspas': 'falseNine', 'Roberto Soldado': 'poacher', 'Aritz Aduriz': 'targetMan',
  'Kevin Gameiro': 'poacher', 'Artem Dovbyk': 'targetMan', 'Borja Iglesias': 'targetMan',
  'Ante Budimir': 'targetMan', 'Vedat Muriqi': 'targetMan', 'Luuk de Jong': 'targetMan',
  'Youssef En-Nesyri': 'targetMan', 'Álvaro Morata': 'poacher', 'Jonas': 'falseNine',
  'Joselu': 'targetMan', 'Radamel Falcao': 'poacher', 'Paco Alcácer': 'poacher',
  'Cristhian Stuani': 'poacher', 'Alexander Sørloth': 'targetMan', 'Antoine Griezmann': 'falseNine',
  'João Félix': 'falseNine', 'Jackson Martínez': 'poacher', 'Willian José': 'targetMan',
}
