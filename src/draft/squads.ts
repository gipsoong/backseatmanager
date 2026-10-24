/**
 * Draft mode's clubs: Premier League squads of single seasons, 2010/11 to 2024/25. Each line is a
 * player: name, positions (his own first, then any secondary and tertiary: 'W/CM'), overall and,
 * where he isn't known by his surname, the name he's known by. Overalls are close to his FIFA /
 * EA FC rating for that season (recalled; treat them as a guide, not a record). A player can be
 * in several seasons' squads; the draft and the league make sure he only turns up once.
 */
import type { Formation, Kit } from '../engine/index.ts'

export type League = 'Premier League' | 'La Liga' | 'Bundesliga' | 'Serie A' | 'Ligue 1'

export interface Pool {
  /** Unset for the Premier League (the original pools). */
  league?: League
  club: string
  shortName: string
  /** The season, e.g. '2015/16'. */
  season: string
  kit: Kit
  formation: Formation
  players: [name: string, positions: string, overall: number, knownAs?: string][]
}

export const kit = (shirt: string, number: string, family: string): Kit => ({ shirt, number, family })
const RED = kit('#c8202f', '#ffffff', 'red')
const CLARET = kit('#7a1f2b', '#9fd3f0', 'red')
const ROYAL = kit('#1f3a8a', '#ffffff', 'blue')
const SKY = kit('#79b4e0', '#10263d', 'blue')
const WHITE = kit('#f2f2ee', '#1b2a4a', 'white')
const BLACK = kit('#232527', '#f2f2ee', 'black')
const GOLD = kit('#f0a81c', '#1b1f1c', 'yellow')
const PALACE = kit('#1b458f', '#f0c330', 'blue')

/** One player a line: `Name, POS[/POS…], overall[, known as]`. */
export function squad(lines: string): Pool['players'] {
  return lines
    .trim()
    .split('\n')
    .map((line) => {
      const [name, positions, overall, knownAs] = line.split(',').map((x) => x.trim())
      return knownAs ? [name, positions, Number(overall), knownAs] : [name, positions, Number(overall)]
    })
}

export const pool = (club: string, shortName: string, season: string, k: Kit, formation: Formation, lines: string): Pool => ({
  club,
  shortName,
  season,
  kit: k,
  formation,
  players: squad(lines),
})

export const POOLS: Pool[] = [
  pool('Arsenal', 'ARS', '2013/14', RED, '4-2-3-1', `
    Wojciech Szczęsny, GK, 82
    Łukasz Fabiański, GK, 77
    Per Mertesacker, CB, 83
    Laurent Koscielny, CB, 82
    Thomas Vermaelen, CB/FB, 81
    Bacary Sagna, FB/CB, 81
    Kieran Gibbs, FB, 78
    Nacho Monreal, FB/CB, 78
    Carl Jenkinson, FB, 72
    Mikel Arteta, DM/CM, 82
    Mathieu Flamini, DM, 77
    Aaron Ramsey, CM/WM, 83
    Jack Wilshere, CM, 81
    Tomáš Rosický, CM/W, 79
    Santi Cazorla, CM/W/DM, 85
    Mesut Özil, CM/W, 86
    Alex Oxlade-Chamberlain, W/CM, 76
    Theo Walcott, W/ST, 82
    Lukas Podolski, W/ST, 82
    Serge Gnabry, W, 70
    Olivier Giroud, ST, 80
    Nicklas Bendtner, ST, 74
  `),
  pool('Arsenal', 'ARS', '2015/16', RED, '4-2-3-1', `
    Petr Čech, GK, 87
    David Ospina, GK, 80
    Laurent Koscielny, CB, 84
    Per Mertesacker, CB, 82
    Gabriel Paulista, CB, 78, Gabriel Paulista
    Héctor Bellerín, FB, 80
    Nacho Monreal, FB/CB, 80
    Kieran Gibbs, FB/WM, 77
    Mathieu Debuchy, FB, 78
    Francis Coquelin, DM/CM, 80
    Mohamed Elneny, DM/CM, 77
    Mikel Arteta, DM/CM, 78
    Santi Cazorla, CM/W/DM, 85
    Aaron Ramsey, CM/WM/W, 83
    Jack Wilshere, CM, 81
    Mesut Özil, CM/W, 87
    Alexis Sánchez, W/ST, 87, Alexis
    Theo Walcott, W/ST, 81
    Alex Oxlade-Chamberlain, W/CM, 77
    Alex Iwobi, W/CM, 70
    Joel Campbell, W, 72
    Olivier Giroud, ST, 81
    Danny Welbeck, ST/W, 79
  `),
  pool('Arsenal', 'ARS', '2022/23', RED, '4-3-3', `
    Aaron Ramsdale, GK, 82
    Matt Turner, GK, 72
    William Saliba, CB, 82
    Gabriel Magalhães, CB, 82, Gabriel
    Rob Holding, CB, 76
    Jakub Kiwior, CB/FB, 76
    Ben White, FB/CB, 81
    Oleksandr Zinchenko, FB/CM, 81
    Kieran Tierney, FB, 80
    Takehiro Tomiyasu, FB/CB, 79
    Thomas Partey, DM/CM, 84
    Jorginho, DM/CM, 84
    Granit Xhaka, CM/DM, 82
    Martin Ødegaard, CM/W, 87
    Fábio Vieira, CM/W, 76, Fábio Vieira
    Mohamed Elneny, DM/CM, 75
    Emile Smith Rowe, CM/W, 78
    Bukayo Saka, W/WM, 86
    Gabriel Martinelli, W/ST, 84
    Leandro Trossard, W/ST/CM, 82
    Reiss Nelson, W, 72
    Gabriel Jesus, ST/W, 82
    Eddie Nketiah, ST, 76
  `),
  pool('Arsenal', 'ARS', '2024/25', RED, '4-3-3', `
    David Raya, GK, 86
    Neto, GK, 78
    William Saliba, CB, 87
    Gabriel Magalhães, CB, 86, Gabriel
    Jakub Kiwior, CB/FB, 77
    Jurriën Timber, FB/CB, 82
    Ben White, FB/CB, 83
    Riccardo Calafiori, FB/CB, 79
    Myles Lewis-Skelly, FB/DM, 72
    Declan Rice, DM/CM, 87
    Thomas Partey, DM/CM, 83
    Jorginho, DM/CM, 81
    Martin Ødegaard, CM/W, 88
    Mikel Merino, CM/DM/ST, 83
    Ethan Nwaneri, W/CM, 70
    Bukayo Saka, W/WM, 88
    Gabriel Martinelli, W/ST, 83
    Leandro Trossard, W/ST/CM, 81
    Raheem Sterling, W, 80
    Kai Havertz, ST/CM, 83
    Gabriel Jesus, ST/W, 80
  `),

  pool('Chelsea', 'CHE', '2011/12', ROYAL, '4-3-3', `
    Petr Čech, GK, 87
    Ross Turnbull, GK, 68
    John Terry, CB, 86
    Gary Cahill, CB, 81
    David Luiz, CB/DM, 82
    Branislav Ivanović, FB/CB, 84
    Ashley Cole, FB, 85
    José Bosingwa, FB, 78
    Ryan Bertrand, FB/WM, 73
    John Obi Mikel, DM, 79, Mikel
    Michael Essien, CM/DM, 84
    Raul Meireles, CM, 81
    Frank Lampard, CM, 86
    Ramires, CM/WM, 82
    Oriol Romeu, DM, 72
    Juan Mata, CM/W, 85
    Florent Malouda, W/WM, 82
    Daniel Sturridge, W/ST, 79
    Salomon Kalou, W/ST, 78
    Didier Drogba, ST, 85
    Fernando Torres, ST, 84
    Nicolas Anelka, ST, 81
  `),
  pool('Chelsea', 'CHE', '2014/15', ROYAL, '4-2-3-1', `
    Thibaut Courtois, GK, 85
    Petr Čech, GK, 86
    John Terry, CB, 84
    Gary Cahill, CB, 83
    Kurt Zouma, CB, 74
    Branislav Ivanović, FB/CB, 84
    César Azpilicueta, FB/CB, 83
    Filipe Luís, FB, 83, Filipe Luís
    Nemanja Matić, DM/CM, 84
    Cesc Fàbregas, CM/DM, 86
    John Obi Mikel, DM, 76, Mikel
    Ramires, CM/WM, 81
    Oscar, CM/W, 83
    Eden Hazard, W/CM, 88
    Willian, W/WM, 83
    André Schürrle, W, 81
    Juan Cuadrado, W/WM, 82
    Mohamed Salah, W, 76
    Diego Costa, ST, 85, Diego Costa
    Didier Drogba, ST, 82
    Loïc Rémy, ST, 80
  `),
  pool('Chelsea', 'CHE', '2016/17', ROYAL, '3-4-3', `
    Thibaut Courtois, GK, 89
    Asmir Begović, GK, 82
    David Luiz, CB/DM, 83
    Gary Cahill, CB, 83
    César Azpilicueta, CB/FB, 84
    John Terry, CB, 82
    Kurt Zouma, CB, 76
    Victor Moses, FB/WM/W, 78
    Marcos Alonso, FB/WM, 80
    N’Golo Kanté, CM/DM, 87
    Nemanja Matić, CM/DM, 84
    Cesc Fàbregas, CM/DM, 84
    Nathaniel Chalobah, CM/DM, 72
    Ruben Loftus-Cheek, CM, 72
    Eden Hazard, W/CM, 90
    Pedro, W, 83
    Willian, W/WM, 84
    Diego Costa, ST, 86, Diego Costa
    Michy Batshuayi, ST, 78
  `),
  pool('Chelsea', 'CHE', '2020/21', ROYAL, '3-4-3', `
    Édouard Mendy, GK, 83
    Kepa Arrizabalaga, GK, 79, Kepa
    Thiago Silva, CB, 85, Thiago Silva
    Antonio Rüdiger, CB, 83
    César Azpilicueta, CB/FB, 84
    Andreas Christensen, CB, 80
    Kurt Zouma, CB, 80
    Reece James, FB/CB, 82
    Ben Chilwell, FB/WM, 82
    Marcos Alonso, FB/WM, 79
    Jorginho, CM/DM, 85
    N’Golo Kanté, CM/DM, 88
    Mateo Kovačić, CM/DM, 84
    Mason Mount, CM/W, 82
    Kai Havertz, W/CM/ST, 83
    Hakim Ziyech, W, 81
    Christian Pulisic, W/CM, 82
    Callum Hudson-Odoi, W, 77
    Timo Werner, ST/W, 83
    Olivier Giroud, ST, 80
    Tammy Abraham, ST, 78
  `),

  pool('Chelsea', 'CHE', '2023/24', ROYAL, '4-2-3-1', `
    Robert Sánchez, GK, 78
    Đorđe Petrović, GK, 76
    Thiago Silva, CB, 83, Thiago Silva
    Levi Colwill, CB/FB, 78
    Axel Disasi, CB, 79
    Benoît Badiashile, CB, 78
    Trevoh Chalobah, CB, 77
    Reece James, FB/CB, 83
    Malo Gusto, FB, 76
    Marc Cucurella, FB/CB, 79
    Ben Chilwell, FB/WM, 81
    Moisés Caicedo, DM/CM/FB, 84
    Enzo Fernández, CM/DM, 84
    Conor Gallagher, CM/DM, 80
    Roméo Lavia, DM, 75
    Cole Palmer, W/CM, 84
    Raheem Sterling, W, 84
    Noni Madueke, W, 76
    Mykhailo Mudryk, W, 77
    Christopher Nkunku, ST/CM, 85
    Nicolas Jackson, ST, 77
  `),

  pool('Liverpool', 'LIV', '2013/14', RED, '4-3-3', `
    Simon Mignolet, GK, 79
    Brad Jones, GK, 70
    Martin Škrtel, CB, 82
    Daniel Agger, CB, 81
    Mamadou Sakho, CB, 79
    Kolo Touré, CB, 78
    Glen Johnson, FB, 81
    Jon Flanagan, FB, 70
    Aly Cissokho, FB, 74
    Steven Gerrard, DM/CM, 85
    Lucas Leiva, DM/CM, 78, Lucas
    Jordan Henderson, CM, 79
    Joe Allen, CM, 78
    Philippe Coutinho, CM/W, 82
    Raheem Sterling, W, 78
    Victor Moses, W, 75
    Luis Suárez, ST/W, 88
    Daniel Sturridge, ST/W, 82
    Iago Aspas, ST, 74
  `),
  pool('Liverpool', 'LIV', '2019/20', RED, '4-3-3', `
    Alisson Becker, GK, 89, Alisson
    Adrián, GK, 78
    Virgil van Dijk, CB, 90
    Joe Gomez, CB/FB, 81
    Joël Matip, CB, 82
    Dejan Lovren, CB, 80
    Andrew Robertson, FB, 87
    Trent Alexander-Arnold, FB/CM, 87
    Fabinho, DM/CB, 86
    Jordan Henderson, CM/DM, 84
    Georginio Wijnaldum, CM, 84
    James Milner, CM/FB, 80
    Naby Keïta, CM, 81
    Alex Oxlade-Chamberlain, CM/W, 79
    Adam Lallana, CM, 78
    Mohamed Salah, W/ST, 90
    Sadio Mané, W/ST, 90
    Xherdan Shaqiri, W, 79
    Takumi Minamino, W/CM, 76
    Roberto Firmino, ST/CM, 87
    Divock Origi, ST, 75
  `),
  pool('Liverpool', 'LIV', '2024/25', RED, '4-2-3-1', `
    Alisson Becker, GK, 89, Alisson
    Caoimhín Kelleher, GK, 78
    Virgil van Dijk, CB, 89
    Ibrahima Konaté, CB, 84
    Joe Gomez, CB/FB, 78
    Jarell Quansah, CB, 74
    Trent Alexander-Arnold, FB/CM, 86
    Andrew Robertson, FB, 84
    Kostas Tsimikas, FB, 77
    Conor Bradley, FB, 74
    Ryan Gravenberch, DM/CM, 82
    Alexis Mac Allister, CM/DM, 86
    Wataru Endō, DM, 77
    Dominik Szoboszlai, CM/W, 82
    Curtis Jones, CM, 79
    Harvey Elliott, CM/W, 76
    Mohamed Salah, W/ST, 89
    Luis Díaz, W/ST, 84
    Cody Gakpo, W/ST, 82
    Federico Chiesa, W, 79
    Diogo Jota, ST/W, 83
    Darwin Núñez, ST, 81
  `),

  pool('Manchester City', 'MCI', '2011/12', SKY, '4-2-3-1', `
    Joe Hart, GK, 84
    Costel Pantilimon, GK, 72
    Vincent Kompany, CB, 86
    Joleon Lescott, CB, 81
    Stefan Savić, CB, 72
    Micah Richards, FB/CB, 79
    Pablo Zabaleta, FB, 80
    Gaël Clichy, FB, 81
    Aleksandar Kolarov, FB/WM, 80
    Gareth Barry, DM/CM, 80
    Nigel de Jong, DM, 81
    Yaya Touré, CM/DM, 86
    James Milner, WM/CM, 79
    David Silva, CM/W, 87
    Samir Nasri, W/CM, 84
    Adam Johnson, W, 77
    Sergio Agüero, ST, 87
    Carlos Tevez, ST, 85
    Mario Balotelli, ST, 82
    Edin Džeko, ST, 82
  `),
  pool('Manchester City', 'MCI', '2013/14', SKY, '4-4-2', `
    Joe Hart, GK, 82
    Costel Pantilimon, GK, 73
    Vincent Kompany, CB, 86
    Martín Demichelis, CB, 80
    Matija Nastasić, CB, 78
    Joleon Lescott, CB, 79
    Pablo Zabaleta, FB, 83
    Gaël Clichy, FB, 80
    Aleksandar Kolarov, FB/WM, 80
    Fernandinho, CM/DM, 83
    Yaya Touré, CM/DM, 87
    Javi García, DM, 79, Javi García
    James Milner, WM/CM, 80
    David Silva, CM/WM, 88
    Samir Nasri, WM/CM, 84
    Jesús Navas, WM, 82, Navas
    Sergio Agüero, ST, 88
    Edin Džeko, ST, 82
    Álvaro Negredo, ST, 82
    Stevan Jovetić, ST, 81
  `),
  pool('Manchester City', 'MCI', '2017/18', SKY, '4-3-3', `
    Ederson, GK, 86
    Claudio Bravo, GK, 82
    Nicolás Otamendi, CB, 84
    John Stones, CB, 81
    Vincent Kompany, CB, 84
    Aymeric Laporte, CB, 84
    Kyle Walker, FB, 84
    Fabian Delph, FB/CM, 77
    Danilo, FB, 78
    Benjamin Mendy, FB, 78
    Fernandinho, DM/CM, 85
    İlkay Gündoğan, CM/DM, 83
    Kevin De Bruyne, CM, 91
    David Silva, CM/W, 89
    Phil Foden, CM/W, 70
    Raheem Sterling, W/ST, 85
    Leroy Sané, W, 85
    Bernardo Silva, W/CM, 84, Bernardo
    Sergio Agüero, ST, 89
    Gabriel Jesus, ST/W, 82
  `),
  pool('Manchester City', 'MCI', '2022/23', SKY, '4-3-3', `
    Ederson, GK, 88
    Stefan Ortega, GK, 78
    Rúben Dias, CB, 88
    John Stones, CB/DM, 84
    Nathan Aké, CB/FB, 82
    Manuel Akanji, CB/FB, 82
    Aymeric Laporte, CB, 84
    Kyle Walker, FB, 84
    João Cancelo, FB, 87
    Rodri, DM, 88
    Kalvin Phillips, DM/CM, 79
    Kevin De Bruyne, CM, 91
    İlkay Gündoğan, CM/DM, 85
    Bernardo Silva, CM/W, 88, Bernardo
    Jack Grealish, W, 84
    Phil Foden, W/CM, 85
    Riyad Mahrez, W, 85
    Cole Palmer, W/CM, 68
    Erling Haaland, ST, 89
    Julián Álvarez, ST/W, 80
  `),

  pool('Manchester United', 'MUN', '2010/11', RED, '4-4-2', `
    Edwin van der Sar, GK, 86
    Tomasz Kuszczak, GK, 72
    Nemanja Vidić, CB, 88
    Rio Ferdinand, CB, 87
    Jonny Evans, CB, 76
    Chris Smalling, CB, 74
    Patrice Evra, FB, 85
    Rafael, FB, 77
    John O’Shea, FB/CB, 77
    Fábio, FB, 72
    Michael Carrick, CM/DM, 82
    Darren Fletcher, CM, 82
    Paul Scholes, CM, 84
    Anderson, CM, 78
    Ryan Giggs, WM/CM, 84
    Nani, WM/W, 85
    Antonio Valencia, WM, 83
    Park Ji-sung, WM/CM, 79, Park
    Wayne Rooney, ST/CM, 89
    Dimitar Berbatov, ST, 84
    Javier Hernández, ST, 78, Chicharito
    Michael Owen, ST, 76
  `),
  pool('Manchester United', 'MUN', '2012/13', RED, '4-4-2', `
    David de Gea, GK, 82
    Anders Lindegaard, GK, 75
    Nemanja Vidić, CB, 86
    Rio Ferdinand, CB, 84
    Jonny Evans, CB, 79
    Chris Smalling, CB, 78
    Phil Jones, CB/DM, 77
    Patrice Evra, FB, 84
    Rafael, FB, 80
    Alexander Büttner, FB, 72
    Michael Carrick, CM/DM, 84
    Tom Cleverley, CM, 76
    Paul Scholes, CM, 80
    Anderson, CM, 76
    Shinji Kagawa, CM/W, 82
    Ryan Giggs, WM/CM, 81
    Antonio Valencia, WM, 83
    Ashley Young, WM/W, 80
    Nani, WM/W, 83
    Robin van Persie, ST, 88
    Wayne Rooney, ST/CM, 88
    Javier Hernández, ST, 79, Chicharito
    Danny Welbeck, ST/W, 76
  `),
  pool('Manchester United', 'MUN', '2017/18', RED, '4-2-3-1', `
    David de Gea, GK, 90
    Sergio Romero, GK, 78
    Victor Lindelöf, CB, 78
    Chris Smalling, CB, 81
    Phil Jones, CB, 79
    Eric Bailly, CB, 81
    Marcos Rojo, CB/FB, 78
    Antonio Valencia, FB/WM, 83
    Ashley Young, FB/WM, 78
    Luke Shaw, FB, 78
    Matteo Darmian, FB, 77
    Nemanja Matić, DM/CM, 84
    Paul Pogba, CM/DM, 88
    Ander Herrera, CM/DM, 82
    Marouane Fellaini, CM, 79
    Juan Mata, CM/W, 84
    Jesse Lingard, W/CM, 79
    Anthony Martial, W/ST, 82
    Marcus Rashford, W/ST, 81
    Alexis Sánchez, W/ST, 87, Alexis
    Romelu Lukaku, ST, 85
    Zlatan Ibrahimović, ST, 85
  `),
  pool('Manchester United', 'MUN', '2021/22', RED, '4-2-3-1', `
    David de Gea, GK, 84
    Dean Henderson, GK, 78
    Raphaël Varane, CB, 86
    Harry Maguire, CB, 81
    Victor Lindelöf, CB, 79
    Eric Bailly, CB, 77
    Luke Shaw, FB, 84
    Aaron Wan-Bissaka, FB, 80
    Diogo Dalot, FB, 76
    Alex Telles, FB, 78
    Fred, DM/CM, 80
    Scott McTominay, DM/CM, 80
    Nemanja Matić, DM, 79
    Paul Pogba, CM/DM, 87
    Bruno Fernandes, CM/W, 88
    Jesse Lingard, CM/W, 77
    Jadon Sancho, W, 87
    Marcus Rashford, W/ST, 85
    Mason Greenwood, W/ST, 79
    Anthony Elanga, W, 70
    Cristiano Ronaldo, ST/W, 91
    Edinson Cavani, ST, 84
  `),

  pool('Tottenham Hotspur', 'TOT', '2012/13', WHITE, '4-2-3-1', `
    Hugo Lloris, GK, 84
    Brad Friedel, GK, 79
    Jan Vertonghen, CB/FB, 81
    Michael Dawson, CB, 77
    William Gallas, CB, 78
    Younès Kaboul, CB, 80
    Steven Caulker, CB, 74
    Kyle Walker, FB, 79
    Benoît Assou-Ekotto, FB, 78
    Kyle Naughton, FB, 70
    Scott Parker, DM, 80
    Sandro, DM, 78
    Mousa Dembélé, CM, 81
    Tom Huddlestone, CM, 75
    Gylfi Sigurðsson, CM/W, 78
    Lewis Holtby, CM, 76
    Clint Dempsey, CM/ST, 80
    Aaron Lennon, W/WM, 80
    Gareth Bale, W/CM, 84
    Jermain Defoe, ST, 80
    Emmanuel Adebayor, ST, 81
  `),
  pool('Tottenham Hotspur', 'TOT', '2016/17', WHITE, '4-2-3-1', `
    Hugo Lloris, GK, 88
    Michel Vorm, GK, 76
    Toby Alderweireld, CB, 86
    Jan Vertonghen, CB/FB, 85
    Eric Dier, DM/CB, 81
    Kevin Wimmer, CB, 74
    Kyle Walker, FB, 83
    Danny Rose, FB, 82
    Kieran Trippier, FB, 77
    Ben Davies, FB, 77
    Victor Wanyama, DM, 81
    Mousa Dembélé, CM/DM, 84
    Harry Winks, CM, 72
    Dele Alli, CM/W, 84
    Christian Eriksen, CM/W, 85
    Moussa Sissoko, CM/W, 78
    Son Heung-min, W/ST, 82, Son
    Erik Lamela, W, 80
    Harry Kane, ST, 86
    Vincent Janssen, ST, 76
  `),
  pool('Tottenham Hotspur', 'TOT', '2022/23', WHITE, '3-4-3', `
    Hugo Lloris, GK, 86
    Fraser Forster, GK, 77
    Cristian Romero, CB, 84
    Eric Dier, CB, 81
    Clément Lenglet, CB, 80
    Davinson Sánchez, CB, 78
    Ben Davies, CB/FB, 79
    Emerson Royal, FB, 79, Emerson Royal
    Ivan Perišić, FB/W, 83
    Pedro Porro, FB, 80
    Matt Doherty, FB, 76
    Pierre-Emile Højbjerg, CM/DM, 83
    Rodrigo Bentancur, CM/DM, 82
    Yves Bissouma, CM/DM, 80
    Oliver Skipp, CM, 75
    Dejan Kulusevski, W/CM, 82
    Son Heung-min, W/ST, 89, Son
    Richarlison, W/ST, 82
    Lucas Moura, W, 79, Lucas Moura
    Arnaut Danjuma, W, 79
    Harry Kane, ST, 90
  `),

  pool('Everton', 'EVE', '2013/14', ROYAL, '4-2-3-1', `
    Tim Howard, GK, 81
    Joel Robles, GK, 72
    Phil Jagielka, CB, 81
    Sylvain Distin, CB, 79
    Antolín Alcaraz, CB, 75
    John Stones, CB/FB, 70
    Leighton Baines, FB/WM, 84
    Séamus Coleman, FB, 78
    Bryan Oviedo, FB, 73
    Tony Hibbert, FB, 72
    Gareth Barry, DM/CM, 80
    James McCarthy, CM/DM, 78
    Leon Osman, CM, 76
    Ross Barkley, CM, 76
    Steven Pienaar, W/CM, 79
    Kevin Mirallas, W, 80
    Gerard Deulofeu, W, 76
    Steven Naismith, CM/ST, 76
    Romelu Lukaku, ST, 83
    Nikica Jelavić, ST, 77
  `),
  pool('Leicester City', 'LEI', '2020/21', ROYAL, '4-2-3-1', `
    Kasper Schmeichel, GK, 84
    Danny Ward, GK, 74
    Jonny Evans, CB, 82
    Çağlar Söyüncü, CB, 80
    Wesley Fofana, CB, 77
    Daniel Amartey, CB/DM, 73
    Timothy Castagne, FB, 80
    James Justin, FB, 76
    Ricardo Pereira, FB, 81
    Luke Thomas, FB, 72
    Wilfred Ndidi, DM/CM, 84
    Youri Tielemans, CM/DM, 84
    Nampalys Mendy, DM, 76
    Hamza Choudhury, CM/DM, 74
    Dennis Praet, CM, 77
    James Maddison, CM/W, 82
    Harvey Barnes, W, 79
    Marc Albrighton, WM/W, 76
    Ayoze Pérez, W/ST, 79, Ayoze
    Cengiz Ünder, W, 78
    Jamie Vardy, ST, 85
    Kelechi Iheanacho, ST, 78
  `),
  pool('Everton', 'EVE', '2020/21', ROYAL, '4-3-3', `
    Jordan Pickford, GK, 82
    Robin Olsen, GK, 77
    Yerry Mina, CB, 79
    Michael Keane, CB, 79
    Ben Godfrey, CB/FB, 77
    Mason Holgate, CB/FB, 77
    Lucas Digne, FB, 83
    Séamus Coleman, FB, 79
    Allan, DM/CM, 82
    Abdoulaye Doucouré, CM, 81
    André Gomes, CM, 81, André Gomes
    Tom Davies, CM, 74
    Gylfi Sigurðsson, CM/W, 79
    James Rodríguez, CM/W, 85, James
    Alex Iwobi, W/CM, 76
    Bernard, W, 76
    Anthony Gordon, W, 70
    Richarlison, W/ST, 82
    Dominic Calvert-Lewin, ST, 80
  `),
  pool('Manchester United', 'MUN', '2023/24', RED, '4-2-3-1', `
    André Onana, GK, 83
    Altay Bayındır, GK, 74
    Lisandro Martínez, CB/FB, 84
    Raphaël Varane, CB, 84
    Harry Maguire, CB, 79
    Jonny Evans, CB, 75
    Victor Lindelöf, CB, 78
    Diogo Dalot, FB, 80
    Luke Shaw, FB, 84
    Aaron Wan-Bissaka, FB, 79
    Casemiro, DM/CM, 87
    Sofyan Amrabat, DM, 78
    Kobbie Mainoo, CM/DM, 72
    Scott McTominay, CM/DM, 79
    Mason Mount, CM/W, 80
    Christian Eriksen, CM, 82
    Bruno Fernandes, CM/W, 87
    Marcus Rashford, W/ST, 85
    Alejandro Garnacho, W, 77
    Antony, W, 81
    Amad Diallo, W, 74, Amad
    Rasmus Højlund, ST, 76
  `),
  pool('Tottenham Hotspur', 'TOT', '2023/24', WHITE, '4-2-3-1', `
    Guglielmo Vicario, GK, 82
    Fraser Forster, GK, 76
    Cristian Romero, CB, 85
    Micky van de Ven, CB, 79
    Radu Drăgușin, CB, 77
    Ben Davies, CB/FB, 78
    Pedro Porro, FB, 81
    Destiny Udogie, FB, 78
    Emerson Royal, FB, 77, Emerson Royal
    Yves Bissouma, DM/CM, 80
    Rodrigo Bentancur, CM/DM, 82
    Pierre-Emile Højbjerg, CM/DM, 82
    Pape Matar Sarr, CM, 76
    James Maddison, CM/W, 84
    Giovani Lo Celso, CM/W, 79
    Dejan Kulusevski, W/CM, 82
    Brennan Johnson, W, 76
    Timo Werner, W/ST, 78
    Son Heung-min, W/ST, 87, Son
    Richarlison, ST/W, 80
  `),
  pool('Leicester City', 'LEI', '2015/16', ROYAL, '4-4-2', `
    Kasper Schmeichel, GK, 80
    Mark Schwarzer, GK, 72
    Wes Morgan, CB, 75
    Robert Huth, CB, 77
    Marcin Wasilewski, CB, 72
    Yohan Benalouane, CB, 72
    Danny Simpson, FB, 74
    Christian Fuchs, FB, 77
    Jeffrey Schlupp, FB/WM, 74
    Ritchie De Laet, FB, 70
    N’Golo Kanté, CM/DM, 82
    Danny Drinkwater, CM, 78
    Andy King, CM, 73
    Gökhan İnler, CM/DM, 77
    Riyad Mahrez, WM/W, 84
    Marc Albrighton, WM, 76
    Demarai Gray, WM/W, 72
    Shinji Okazaki, ST, 78
    Jamie Vardy, ST, 83
    Leonardo Ulloa, ST, 75
  `),
  pool('Southampton', 'SOU', '2015/16', RED, '4-2-3-1', `
    Fraser Forster, GK, 80
    Maarten Stekelenburg, GK, 77
    José Fonte, CB, 79
    Virgil van Dijk, CB, 80
    Maya Yoshida, CB, 75
    Cédric Soares, FB, 77, Cédric
    Ryan Bertrand, FB, 80
    Cuco Martina, FB, 74
    Victor Wanyama, DM, 80
    Oriol Romeu, DM, 75
    Jordy Clasie, CM, 77
    Steven Davis, CM, 76
    James Ward-Prowse, CM, 75
    Dušan Tadić, W/CM, 80
    Sadio Mané, W/ST, 81
    Juanmi, W, 74
    Graziano Pellè, ST, 79
    Shane Long, ST, 76
    Charlie Austin, ST, 76
  `),
  pool('Newcastle United', 'NEW', '2011/12', BLACK, '4-4-2', `
    Tim Krul, GK, 79
    Steve Harper, GK, 72
    Fabricio Coloccini, CB, 81
    Mike Williamson, CB, 74
    Steven Taylor, CB, 74
    Danny Simpson, FB, 74
    Davide Santon, FB, 76
    Ryan Taylor, FB/WM, 72
    Cheick Tioté, DM/CM, 80
    Yohan Cabaye, CM, 82
    Danny Guthrie, CM, 74
    Hatem Ben Arfa, WM/W, 80
    Jonás Gutiérrez, WM, 76
    Gabriel Obertan, WM, 72
    Sylvain Marveaux, WM, 72
    Demba Ba, ST, 81
    Papiss Cissé, ST, 80
    Leon Best, ST, 72
    Shola Ameobi, ST, 70
  `),
  pool('Newcastle United', 'NEW', '2023/24', BLACK, '4-3-3', `
    Nick Pope, GK, 84
    Martin Dúbravka, GK, 76
    Sven Botman, CB, 82
    Fabian Schär, CB, 80
    Dan Burn, CB/FB, 78
    Jamaal Lascelles, CB, 77
    Kieran Trippier, FB, 84
    Tino Livramento, FB, 76
    Lewis Hall, FB, 74
    Emil Krafth, FB, 72
    Bruno Guimarães, DM/CM, 86, Bruno Guimarães
    Sandro Tonali, CM/DM, 83
    Sean Longstaff, CM, 78
    Joelinton, CM/ST, 82
    Lewis Miley, CM, 70
    Anthony Gordon, W, 80
    Miguel Almirón, W, 78
    Harvey Barnes, W, 78
    Jacob Murphy, W/WM, 76
    Alexander Isak, ST, 84
    Callum Wilson, ST, 79
  `),
  pool('Aston Villa', 'AVL', '2023/24', CLARET, '4-2-3-1', `
    Emiliano Martínez, GK, 85
    Robin Olsen, GK, 76
    Ezri Konsa, CB/FB, 80
    Pau Torres, CB, 82
    Diego Carlos, CB, 80, Diego Carlos
    Tyrone Mings, CB, 80
    Matty Cash, FB, 79
    Lucas Digne, FB, 79
    Álex Moreno, FB, 75
    Boubacar Kamara, DM, 81
    Douglas Luiz, CM/DM, 83, Douglas Luiz
    Youri Tielemans, CM, 80
    John McGinn, CM/W, 80
    Jacob Ramsey, CM/W, 78
    Morgan Rogers, CM/W, 74
    Leon Bailey, W, 81
    Moussa Diaby, W, 82
    Nicolò Zaniolo, W/CM, 78
    Ollie Watkins, ST, 82
    Jhon Durán, ST, 72
  `),
  pool('West Ham United', 'WHU', '2015/16', CLARET, '4-2-3-1', `
    Adrián, GK, 80
    Darren Randolph, GK, 74
    Winston Reid, CB, 79
    Angelo Ogbonna, CB, 79
    James Collins, CB, 75
    James Tomkins, CB, 75
    Aaron Cresswell, FB, 78
    Carl Jenkinson, FB, 72
    Michail Antonio, WM/FB/ST, 76
    Mark Noble, CM, 79
    Cheikhou Kouyaté, CM/DM, 78
    Pedro Obiang, DM, 77
    Alex Song, DM, 77
    Manuel Lanzini, CM/W, 79
    Dimitri Payet, W/CM, 84
    Victor Moses, W, 76
    Enner Valencia, ST/W, 76
    Andy Carroll, ST, 77
    Diafra Sakho, ST, 77
  `),
  pool('West Ham United', 'WHU', '2022/23', CLARET, '4-2-3-1', `
    Łukasz Fabiański, GK, 80
    Alphonse Areola, GK, 79
    Kurt Zouma, CB, 81
    Nayef Aguerd, CB, 79
    Angelo Ogbonna, CB, 77
    Craig Dawson, CB, 77
    Thilo Kehrer, FB/CB, 77
    Vladimír Coufal, FB, 77
    Aaron Cresswell, FB/CB, 77
    Emerson Palmieri, FB, 77, Emerson
    Declan Rice, DM/CM, 84
    Tomáš Souček, CM/DM, 81
    Lucas Paquetá, CM/W, 82
    Flynn Downes, DM, 74
    Pablo Fornals, CM/W, 78
    Jarrod Bowen, W/ST, 82
    Saïd Benrahma, W, 79
    Maxwel Cornet, W, 77
    Michail Antonio, ST, 79
    Gianluca Scamacca, ST, 79
    Danny Ings, ST, 78
  `),
  pool('Brighton & Hove Albion', 'BHA', '2022/23', kit('#2a5fb0', '#ffffff', 'blue'), '4-2-3-1', `
    Robert Sánchez, GK, 80
    Jason Steele, GK, 74
    Lewis Dunk, CB, 81
    Adam Webster, CB, 77
    Levi Colwill, CB/FB, 75
    Jan Paul van Hecke, CB, 74
    Joël Veltman, FB/CB, 77
    Pervis Estupiñán, FB, 80
    Tariq Lamptey, FB, 75
    Moisés Caicedo, DM/CM, 82
    Alexis Mac Allister, CM, 82
    Pascal Groß, CM/FB/W, 79
    Billy Gilmour, CM, 75
    Adam Lallana, CM, 76
    Facundo Buonanotte, CM/W, 70
    Kaoru Mitoma, W, 80
    Solly March, W, 78
    Julio Enciso, W/CM, 74
    Danny Welbeck, ST, 76
    Evan Ferguson, ST, 75
    Deniz Undav, ST, 75
  `),
  pool('Crystal Palace', 'CRY', '2024/25', PALACE, '3-4-3', `
    Dean Henderson, GK, 80
    Matt Turner, GK, 74
    Marc Guéhi, CB, 84
    Maxence Lacroix, CB, 79
    Chris Richards, CB, 75
    Trevoh Chalobah, CB, 77
    Nathaniel Clyne, FB/CB, 73
    Daniel Muñoz, FB, 80
    Tyrick Mitchell, FB, 77
    Adam Wharton, CM/DM, 77
    Jefferson Lerma, CM/DM, 77
    Will Hughes, CM, 74
    Cheick Doucouré, DM, 78
    Daichi Kamada, CM, 78
    Eberechi Eze, W/CM, 82
    Ismaïla Sarr, W, 79
    Justin Devenny, W/CM, 65
    Jean-Philippe Mateta, ST, 80
    Eddie Nketiah, ST/W, 76
  `),
  pool('Wolverhampton Wanderers', 'WOL', '2019/20', GOLD, '3-4-3', `
    Rui Patrício, GK, 83, Rui Patrício
    John Ruddy, GK, 74
    Conor Coady, CB, 77
    Willy Boly, CB, 78
    Romain Saïss, CB/DM, 77
    Max Kilman, CB, 68
    Matt Doherty, FB, 79
    Jonny, FB, 78
    Rúben Vinagre, FB, 74
    Rúben Neves, CM/DM, 81, Rúben Neves
    João Moutinho, CM, 82, Moutinho
    Leander Dendoncker, CM/DM/CB, 77
    Morgan Gibbs-White, CM, 70
    Adama Traoré, W, 79, Adama
    Pedro Neto, W, 77, Pedro Neto
    Daniel Podence, W, 76
    Diogo Jota, W/ST, 80
    Raúl Jiménez, ST, 81
    Patrick Cutrone, ST, 76
  `),
  pool('Leeds United', 'LEE', '2020/21', WHITE, '4-1-4-1', `
    Illan Meslier, GK, 78
    Kiko Casilla, GK, 76
    Robin Koch, CB/DM, 77
    Diego Llorente, CB, 78
    Liam Cooper, CB, 75
    Pascal Struijk, CB/DM, 72
    Luke Ayling, FB/CB, 76
    Stuart Dallas, FB/CM/WM, 77
    Ezgjan Alioski, FB/WM, 75
    Kalvin Phillips, DM/CM, 83
    Mateusz Klich, CM, 77
    Jamie Shackleton, CM/FB, 69
    Tyler Roberts, CM/ST, 74
    Rodrigo, CM/ST, 80, Rodrigo
    Raphinha, WM/W, 82
    Jack Harrison, WM/W, 76
    Hélder Costa, WM/W, 75
    Pablo Hernández, CM/W, 76
    Ian Poveda, W, 68
    Patrick Bamford, ST, 79
  `),
  pool('Burnley', 'BUR', '2017/18', CLARET, '4-4-2', `
    Nick Pope, GK, 79
    Tom Heaton, GK, 79
    Ben Mee, CB, 76
    James Tarkowski, CB, 77
    Kevin Long, CB, 73
    Matthew Lowton, FB, 75
    Stephen Ward, FB, 75
    Phil Bardsley, FB, 73
    Charlie Taylor, FB, 72
    Jack Cork, CM/DM, 77
    Steven Defour, CM, 76
    Ashley Westwood, CM, 77
    Jeff Hendrick, CM/WM, 75
    Scott Arfield, CM/WM, 75
    Aaron Lennon, WM/W, 76
    Jóhann Berg Guðmundsson, WM, 76, Guðmundsson
    Robbie Brady, WM/FB, 76
    Chris Wood, ST, 77
    Ashley Barnes, ST, 76
    Sam Vokes, ST, 74
  `),
  pool('Swansea City', 'SWA', '2014/15', WHITE, '4-2-3-1', `
    Łukasz Fabiański, GK, 80
    Gerhard Tremmel, GK, 70
    Ashley Williams, CB, 81
    Federico Fernández, CB, 77
    Kyle Bartley, CB, 70
    Ángel Rangel, FB, 75
    Neil Taylor, FB, 76
    Kyle Naughton, FB, 74
    Jack Cork, DM/CM, 75
    Leon Britton, CM/DM, 76
    Ki Sung-yueng, CM, 77, Ki
    Jonjo Shelvey, CM, 77
    Gylfi Sigurðsson, CM/W, 82
    Wayne Routledge, W, 76
    Jefferson Montero, W, 77
    Nathan Dyer, W, 76
    Modou Barrow, W, 70
    Wilfried Bony, ST, 82
    Bafétimbi Gomis, ST, 79
  `),
  pool('Nottingham Forest', 'NFO', '2024/25', RED, '4-2-3-1', `
    Matz Sels, GK, 79
    Carlos Miguel, GK, 72, Carlos Miguel
    Murillo, CB, 81
    Nikola Milenković, CB, 81
    Morato, CB, 74
    Ola Aina, FB, 78
    Neco Williams, FB, 75
    Álex Moreno, FB, 75
    Elliot Anderson, CM/DM, 79
    Ryan Yates, DM/CM, 77
    Danilo, CM, 75
    Nicolás Domínguez, CM, 75
    Morgan Gibbs-White, CM/W, 81
    Callum Hudson-Odoi, W, 78
    Anthony Elanga, W, 79
    Jota Silva, W, 73, Jota Silva
    Chris Wood, ST, 80
    Ramón Sosa, W, 72
    Harry Toffolo, FB, 72
    Taiwo Awoniyi, ST, 75
  `),
  pool('Sheffield United', 'SHU', '2019/20', RED, '3-5-2', `
    Dean Henderson, GK, 80
    Simon Moore, GK, 70
    John Egan, CB, 74
    Chris Basham, CB, 74
    Jack O’Connell, CB, 74
    Jack Robinson, CB, 72
    Enda Stevens, FB, 75
    George Baldock, FB, 74
    Oliver Norwood, DM, 76
    John Fleck, CM, 75
    John Lundstram, CM, 74
    Sander Berge, CM/DM, 77
    Ben Osborn, CM/WM, 72
    Oliver McBurnie, ST, 74
    David McGoldrick, ST, 75
    Lys Mousset, ST, 74
    Billy Sharp, ST, 73
    Phil Jagielka, CB, 74
    Luke Freeman, CM/WM, 72
  `),
]
