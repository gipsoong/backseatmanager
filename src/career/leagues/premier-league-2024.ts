/**
 * The Premier League 2024/25 for a real career: the twenty clubs and their first-team squads as
 * they stood at the end of the summer window (1 September 2024; loans counted at the club they were
 * loaned to). One player a line: `Name, POS[/POS…], overall, born, foot[, known as]`. Names are
 * spelled as in the draft's squads files (draft/squads.ts) so a player is the same man in both;
 * overalls are our estimate of his EA FC 25 rating (the four 2024/25 club-seasons already in the
 * draft keep theirs). Birth years from public records; ages in a season are its year less his birth year.
 */
import type { RealClub } from '../real.ts'
import { kit } from '../../draft/squads.ts'

export const SEASON = 2024

export const CLUBS: RealClub[] = [
  {
    club: 'Arsenal', shortName: 'ARS', kit: kit('#c8202f', '#ffffff', 'red'), formation: '4-3-3', players: `
    David Raya, GK, 86, 1995, R
    Neto, GK, 78, 1989, R
    William Saliba, CB, 87, 2001, R
    Gabriel Magalhães, CB, 86, 1997, L, Gabriel
    Jakub Kiwior, CB/FB, 77, 2000, L
    Jurriën Timber, FB/CB, 82, 2001, R
    Ben White, FB/CB, 83, 1997, R
    Riccardo Calafiori, FB/CB, 79, 2002, L
    Takehiro Tomiyasu, FB/CB, 79, 1998, R
    Oleksandr Zinchenko, FB/CM, 79, 1996, L
    Kieran Tierney, FB, 76, 1997, L
    Myles Lewis-Skelly, FB/DM, 72, 2006, L
    Declan Rice, DM/CM, 87, 1999, R
    Thomas Partey, DM/CM, 83, 1993, R
    Jorginho, DM/CM, 81, 1991, R
    Martin Ødegaard, CM/W, 88, 1998, L
    Mikel Merino, CM/DM/ST, 83, 1996, L
    Ethan Nwaneri, W/CM, 70, 2007, L
    Bukayo Saka, W/WM, 88, 2001, L
    Gabriel Martinelli, W/ST, 83, 2001, R
    Leandro Trossard, W/ST/CM, 81, 1994, R
    Raheem Sterling, W, 80, 1994, R
    Kai Havertz, ST/CM, 83, 1999, L
    Gabriel Jesus, ST/W, 80, 1997, R
  ` },
  {
    club: 'Aston Villa', shortName: 'AVL', kit: kit('#7a1f2b', '#9fd3f0', 'red'), formation: '4-2-3-1', players: `
    Emiliano Martínez, GK, 87, 1992, R
    Robin Olsen, GK, 74, 1990, R
    Joe Gauci, GK, 65, 2000, R
    Ezri Konsa, CB/FB, 82, 1997, R
    Pau Torres, CB, 82, 1997, L
    Diego Carlos, CB, 79, 1993, R, Diego Carlos
    Tyrone Mings, CB, 78, 1993, L
    Matty Cash, FB, 79, 1997, R
    Lucas Digne, FB, 79, 1993, L
    Ian Maatsen, FB, 77, 2002, L
    Kosta Nedeljković, FB, 65, 2005, R
    Boubacar Kamara, DM, 82, 1999, R
    Amadou Onana, DM/CM, 81, 2001, R
    Lamare Bogarde, DM, 66, 2004, R
    Youri Tielemans, CM, 82, 1997, R
    John McGinn, CM/W, 81, 1994, L
    Jacob Ramsey, CM/W, 78, 2001, R
    Ross Barkley, CM, 75, 1993, R
    Morgan Rogers, CM/W, 77, 2002, R
    Emiliano Buendía, W/CM, 78, 1996, R
    Leon Bailey, W, 81, 1997, L
    Jaden Philogene, W, 72, 2002, L
    Ollie Watkins, ST, 84, 1995, R
    Jhon Durán, ST, 76, 2003, R
  ` },
  {
    club: 'Bournemouth', shortName: 'BOU', kit: kit('#b50e12', '#111111', 'red'), formation: '4-2-3-1', players: `
    Kepa Arrizabalaga, GK, 80, 1994, R, Kepa
    Mark Travers, GK, 72, 1999, R
    Illia Zabarnyi, CB, 79, 2002, R
    Marcos Senesi, CB, 78, 1997, L
    Dean Huijsen, CB, 74, 2005, R
    James Hill, CB/FB, 68, 2002, R
    Adam Smith, FB, 74, 1991, R
    Milos Kerkez, FB, 77, 2003, L
    Julián Araujo, FB, 72, 2001, R
    Max Aarons, FB, 72, 2000, R
    Lewis Cook, DM/CM, 76, 1997, R
    Tyler Adams, DM, 76, 1999, R
    Ryan Christie, CM, 76, 1995, R
    Alex Scott, CM, 74, 2003, R
    Philip Billing, CM, 76, 1996, R
    David Brooks, W/CM, 74, 1997, L
    Marcus Tavernier, W/CM, 77, 1999, L
    Justin Kluivert, W/CM, 79, 1999, R
    Antoine Semenyo, W/ST, 77, 2000, R
    Dango Ouattara, W, 76, 2002, R
    Luis Sinisterra, W, 76, 1999, L
    Evanilson, ST, 80, 1999, R
    Enes Ünal, ST, 76, 1997, R
  ` },
  {
    club: 'Brentford', shortName: 'BRE', kit: kit('#e30613', '#ffffff', 'red'), formation: '4-3-3', players: `
    Mark Flekken, GK, 79, 1993, R
    Hákon Valdimarsson, GK, 70, 2001, R
    Ethan Pinnock, CB, 77, 1993, L
    Nathan Collins, CB, 78, 2001, R
    Kristoffer Ajer, CB/FB, 76, 1998, R
    Ben Mee, CB, 75, 1989, L
    Sepp van den Berg, CB, 74, 2001, R
    Aaron Hickey, FB, 75, 2002, R
    Mads Roerslev, FB, 72, 1999, R
    Rico Henry, FB, 75, 1997, L
    Keane Lewis-Potter, FB/W, 74, 2001, R
    Christian Nørgaard, DM/CM, 79, 1994, R
    Vitaly Janelt, CM/DM, 76, 1998, L
    Mathias Jensen, CM, 77, 1996, R
    Mikkel Damsgaard, CM/W, 77, 2000, R
    Yehor Yarmolyuk, CM, 68, 2004, R
    Fábio Carvalho, CM/W, 74, 2002, L, Fábio Carvalho
    Josh Dasilva, CM, 72, 1998, R
    Bryan Mbeumo, W/ST, 80, 1999, L
    Kevin Schade, W/ST, 75, 2001, R
    Gustavo Nunes, W, 66, 2005, R
    Yoane Wissa, ST/W, 79, 1996, R
    Igor Thiago, ST, 75, 2001, R, Igor Thiago
  ` },
  {
    club: 'Brighton & Hove Albion', shortName: 'BHA', kit: kit('#2a5fb0', '#ffffff', 'blue'), formation: '4-2-3-1', players: `
    Bart Verbruggen, GK, 78, 2002, R
    Jason Steele, GK, 73, 1990, R
    Lewis Dunk, CB, 81, 1991, R
    Jan Paul van Hecke, CB, 78, 2000, R
    Igor Julio, CB, 77, 1998, L, Igor
    Adam Webster, CB, 76, 1995, L
    Joël Veltman, FB/CB, 77, 1992, R
    Pervis Estupiñán, FB, 80, 1998, L
    Tariq Lamptey, FB, 74, 2000, R
    Jack Hinshelwood, FB/CM, 70, 2005, R
    Carlos Baleba, DM, 76, 2004, R
    Mats Wieffer, DM/FB, 78, 1999, R
    Yasin Ayari, CM, 72, 2003, R
    Matt O'Riley, CM, 79, 2000, L
    James Milner, CM/FB, 75, 1986, R
    Georginio Rutter, CM/ST, 78, 2002, R
    Kaoru Mitoma, W, 81, 1997, R
    Solly March, W, 77, 1994, L
    Simon Adingra, W, 77, 2002, R
    Yankuba Minteh, W, 73, 2004, L
    Brajan Gruda, W/CM, 74, 2004, R
    Julio Enciso, W/CM, 74, 2004, R
    Danny Welbeck, ST, 76, 1990, R
    Evan Ferguson, ST, 76, 2004, R
    João Pedro, ST/CM, 79, 2001, R
  ` },
  {
    club: 'Chelsea', shortName: 'CHE', kit: kit('#1f3a8a', '#ffffff', 'blue'), formation: '4-2-3-1', players: `
    Robert Sánchez, GK, 78, 1997, R
    Filip Jörgensen, GK, 76, 2002, R
    Levi Colwill, CB/FB, 79, 2003, L
    Wesley Fofana, CB, 79, 2000, R
    Benoît Badiashile, CB, 78, 2001, L
    Tosin Adarabioyo, CB, 77, 1997, R
    Axel Disasi, CB, 79, 1998, R
    Renato Veiga, CB/DM, 73, 2003, L
    Reece James, FB/CB, 82, 1999, R
    Malo Gusto, FB, 78, 2003, R
    Marc Cucurella, FB/CB, 80, 1998, L
    Ben Chilwell, FB, 78, 1996, L
    Moisés Caicedo, DM/CM/FB, 84, 2001, R
    Roméo Lavia, DM, 76, 2004, R
    Enzo Fernández, CM/DM, 84, 2001, R
    Kiernan Dewsbury-Hall, CM, 77, 1998, R
    Cole Palmer, CM/W, 87, 2002, L
    Noni Madueke, W, 78, 2002, L
    Pedro Neto, W, 81, 2000, L
    Mykhailo Mudryk, W, 76, 2001, R
    Jadon Sancho, W, 80, 2000, R
    João Félix, W/ST, 80, 1999, R, João Félix
    Christopher Nkunku, ST/CM, 83, 1997, R
    Nicolas Jackson, ST, 79, 2001, R
    Marc Guiu, ST, 66, 2006, R
  ` },
  {
    club: 'Crystal Palace', shortName: 'CRY', kit: kit('#1b458f', '#f0c330', 'blue'), formation: '3-4-3', players: `
    Dean Henderson, GK, 80, 1997, R
    Matt Turner, GK, 74, 1994, R
    Joe Whitworth, GK, 62, 2004, R
    Marc Guéhi, CB, 84, 2000, R
    Maxence Lacroix, CB, 79, 2000, R
    Chris Richards, CB, 75, 2000, R
    Trevoh Chalobah, CB, 77, 1999, R
    Chadi Riad, CB, 72, 2003, R
    Nathaniel Clyne, FB/CB, 73, 1991, R
    Joel Ward, FB/CB, 72, 1989, R
    Daniel Muñoz, FB, 80, 1996, R
    Tyrick Mitchell, FB, 77, 1999, L
    Adam Wharton, CM/DM, 77, 2004, L
    Jefferson Lerma, CM/DM, 77, 1994, R
    Will Hughes, CM, 74, 1995, L
    Cheick Doucouré, DM, 78, 2000, R
    Daichi Kamada, CM, 78, 1996, R
    Jeffrey Schlupp, WM/FB, 72, 1992, L
    Eberechi Eze, W/CM, 82, 1998, R
    Ismaïla Sarr, W, 79, 1998, R
    Justin Devenny, W/CM, 65, 2003, R
    Matheus França, W, 68, 2004, R, Matheus França
    Jean-Philippe Mateta, ST, 80, 1997, R
    Eddie Nketiah, ST/W, 76, 1999, R
  ` },
  {
    club: 'Everton', shortName: 'EVE', kit: kit('#274488', '#ffffff', 'blue'), formation: '4-2-3-1', players: `
    Jordan Pickford, GK, 83, 1994, L
    João Virgínia, GK, 70, 1999, R
    Asmir Begović, GK, 68, 1987, R
    James Tarkowski, CB, 79, 1992, R
    Jarrad Branthwaite, CB, 79, 2002, L
    Michael Keane, CB, 76, 1993, R
    Jake O'Brien, CB, 72, 2001, R
    Séamus Coleman, FB, 74, 1988, R
    Ashley Young, FB/WM, 74, 1985, R
    Vitaliy Mykolenko, FB, 77, 1999, L
    Nathan Patterson, FB, 72, 2001, R
    Idrissa Gueye, DM/CM, 78, 1989, R
    Tim Iroegbunam, DM/CM, 68, 2003, R
    James Garner, CM/DM, 77, 2001, R
    Abdoulaye Doucouré, CM, 77, 1993, R
    Dwight McNeil, W/CM, 78, 1999, L
    Iliman Ndiaye, W/CM, 77, 2000, R
    Jack Harrison, W, 76, 1996, L
    Jesper Lindstrøm, W/CM, 75, 2000, R
    Armando Broja, ST, 74, 2001, R
    Dominic Calvert-Lewin, ST, 77, 1997, R
    Beto, ST, 74, 1998, R
    Youssef Chermiti, ST, 68, 2004, R
  ` },
  {
    club: 'Fulham', shortName: 'FUL', kit: kit('#f2f2ee', '#111111', 'white'), formation: '4-2-3-1', players: `
    Bernd Leno, GK, 82, 1992, R
    Steven Benda, GK, 68, 1998, R
    Joachim Andersen, CB, 80, 1996, R
    Calvin Bassey, CB/FB, 77, 1999, L
    Issa Diop, CB, 76, 1997, R
    Jorge Cuenca, CB, 74, 1999, L
    Timothy Castagne, FB, 77, 1995, R
    Kenny Tete, FB, 76, 1995, R
    Antonee Robinson, FB, 79, 1997, L
    Ryan Sessegnon, FB/WM, 70, 2000, L
    Sander Berge, DM/CM, 78, 1998, R
    Saša Lukić, CM/DM, 76, 1996, R
    Harrison Reed, CM/DM, 75, 1995, R
    Tom Cairney, CM, 75, 1991, L
    Andreas Pereira, CM/W, 78, 1996, R
    Emile Smith Rowe, CM/W, 78, 2000, R
    Alex Iwobi, W/CM, 78, 1996, R
    Adama Traoré, W, 76, 1996, R
    Harry Wilson, W, 75, 1997, L
    Reiss Nelson, W, 73, 1999, R
    Raúl Jiménez, ST, 77, 1991, R
    Rodrigo Muniz, ST, 75, 2001, R
  ` },
  {
    club: 'Ipswich Town', shortName: 'IPS', kit: kit('#1d4f9c', '#ffffff', 'blue'), formation: '4-2-3-1', players: `
    Arijanet Muric, GK, 74, 1998, R
    Christian Walton, GK, 70, 1995, R
    Jacob Greaves, CB, 72, 2000, L
    Dara O'Shea, CB, 74, 1999, R
    Luke Woolfenden, CB, 71, 1998, R
    Cameron Burgess, CB, 70, 1995, L
    Axel Tuanzebe, CB/FB, 71, 1997, R
    Harry Clarke, FB, 70, 2001, R
    Leif Davis, FB, 75, 1999, L
    Ben Johnson, FB, 72, 2000, R
    Conor Townsend, FB, 70, 1993, L
    Sam Morsy, DM/CM, 74, 1991, R
    Kalvin Phillips, DM/CM, 74, 1995, R
    Jens Cajuste, CM, 74, 1999, R
    Massimo Luongo, CM, 71, 1992, R
    Jack Taylor, CM, 70, 1998, R
    Omari Hutchinson, W/CM, 74, 2003, L
    Conor Chaplin, CM/W, 72, 1997, R
    Wes Burns, W/FB, 72, 1994, R
    Jack Clarke, W, 74, 2000, R
    Sammie Szmodics, CM/ST, 74, 1995, R
    Liam Delap, ST, 74, 2003, R
    George Hirst, ST, 69, 1999, R
    Ali Al-Hamadi, ST, 68, 2002, R
  ` },
  {
    club: 'Leicester City', shortName: 'LEI', kit: kit('#1d3f9a', '#ffffff', 'blue'), formation: '4-2-3-1', players: `
    Mads Hermansen, GK, 75, 2000, R
    Danny Ward, GK, 70, 1993, R
    Wout Faes, CB, 76, 1998, R
    Jannik Vestergaard, CB, 75, 1992, R
    Conor Coady, CB, 74, 1993, R
    Caleb Okoli, CB, 72, 2001, R
    James Justin, FB/CB, 76, 1998, R
    Ricardo Pereira, FB, 77, 1993, R
    Victor Kristiansen, FB, 73, 2002, L
    Wilfred Ndidi, DM/CM, 77, 1996, R
    Harry Winks, CM/DM, 75, 1996, R
    Boubakary Soumaré, DM/CM, 75, 1999, R
    Oliver Skipp, CM/DM, 75, 2000, R
    Hamza Choudhury, DM, 70, 1997, R
    Facundo Buonanotte, CM/W, 74, 2004, L
    Bilal El Khannouss, CM/W, 75, 2004, R
    Stephy Mavididi, W, 76, 1998, L
    Abdul Fatawu, W, 73, 2004, L
    Kasey McAteer, W, 69, 2001, R
    Bobby Decordova-Reid, W/ST, 74, 1993, R
    Jordan Ayew, W/ST, 74, 1991, R
    Jamie Vardy, ST, 77, 1987, R
    Patson Daka, ST, 74, 1998, R
    Odsonne Édouard, ST, 74, 1998, L
  ` },
  {
    club: 'Liverpool', shortName: 'LIV', kit: kit('#c8102e', '#ffffff', 'red'), formation: '4-2-3-1', players: `
    Alisson Becker, GK, 89, 1992, R, Alisson
    Caoimhín Kelleher, GK, 78, 1998, R
    Vitězslav Jaroš, GK, 66, 2001, R
    Virgil van Dijk, CB, 89, 1991, R
    Ibrahima Konaté, CB, 84, 1999, R
    Joe Gomez, CB/FB, 78, 1997, R
    Jarell Quansah, CB, 74, 2003, R
    Trent Alexander-Arnold, FB/CM, 86, 1998, R
    Andrew Robertson, FB, 84, 1994, L
    Kostas Tsimikas, FB, 77, 1996, L
    Conor Bradley, FB, 74, 2003, R
    Ryan Gravenberch, DM/CM, 82, 2002, R
    Alexis Mac Allister, CM/DM, 86, 1998, R
    Wataru Endō, DM, 77, 1993, R
    Tyler Morton, DM/CM, 68, 2002, R
    Dominik Szoboszlai, CM/W, 82, 2000, R
    Curtis Jones, CM, 79, 2001, R
    Harvey Elliott, CM/W, 76, 2003, L
    Mohamed Salah, W/ST, 89, 1992, L
    Luis Díaz, W/ST, 84, 1997, R
    Cody Gakpo, W/ST, 82, 1999, R
    Federico Chiesa, W, 79, 1997, R
    Diogo Jota, ST/W, 83, 1996, R
    Darwin Núñez, ST, 81, 1999, R
    Jayden Danns, ST, 63, 2006, R
  ` },
  {
    club: 'Manchester City', shortName: 'MCI', kit: kit('#79b4e0', '#10263d', 'blue'), formation: '4-3-3', players: `
    Ederson, GK, 88, 1993, L
    Stefan Ortega, GK, 80, 1992, R
    Scott Carson, GK, 65, 1985, R
    Rúben Dias, CB, 88, 1997, R
    John Stones, CB/DM, 84, 1994, R
    Manuel Akanji, CB/FB, 83, 1995, R
    Nathan Aké, CB/FB, 83, 1995, L
    Joško Gvardiol, CB/FB, 85, 2002, L
    Kyle Walker, FB, 83, 1990, R
    Rico Lewis, FB/CM, 77, 2004, R
    Rodri, DM, 91, 1996, R
    Mateo Kovačić, CM/DM, 83, 1994, R
    Kevin De Bruyne, CM, 90, 1991, R
    İlkay Gündoğan, CM/DM, 84, 1990, R
    Bernardo Silva, CM/W, 88, 1994, L, Bernardo
    Matheus Nunes, CM/W, 79, 1998, R, Matheus Nunes
    James McAtee, CM, 72, 2002, R
    Phil Foden, W/CM, 88, 2000, L
    Jack Grealish, W, 82, 1995, R
    Jérémy Doku, W, 81, 2002, R
    Savinho, W, 79, 2004, L
    Oscar Bobb, W, 73, 2003, L
    Erling Haaland, ST, 91, 2000, L
  ` },
  {
    club: 'Manchester United', shortName: 'MUN', kit: kit('#da291c', '#ffffff', 'red'), formation: '4-2-3-1', players: `
    André Onana, GK, 82, 1996, R
    Altay Bayındır, GK, 73, 1998, R
    Lisandro Martínez, CB/FB, 84, 1998, L
    Matthijs de Ligt, CB, 84, 1999, R
    Harry Maguire, CB, 78, 1993, R
    Leny Yoro, CB, 76, 2005, R
    Victor Lindelöf, CB, 76, 1994, R
    Jonny Evans, CB, 73, 1988, R
    Diogo Dalot, FB, 81, 1999, R
    Noussair Mazraoui, FB, 81, 1997, R
    Luke Shaw, FB, 82, 1995, L
    Tyrell Malacia, FB, 74, 1999, L
    Casemiro, DM/CM, 83, 1992, R
    Manuel Ugarte, DM, 80, 2001, R
    Kobbie Mainoo, CM/DM, 78, 2005, R
    Christian Eriksen, CM, 78, 1992, R
    Mason Mount, CM/W, 78, 1999, R
    Bruno Fernandes, CM/W, 87, 1994, R
    Marcus Rashford, W/ST, 82, 1997, R
    Alejandro Garnacho, W, 80, 2004, R
    Antony, W, 77, 2000, L
    Amad Diallo, W, 75, 2002, L, Amad
    Rasmus Højlund, ST, 78, 2003, L
    Joshua Zirkzee, ST, 78, 2001, L
  ` },
  {
    club: 'Newcastle United', shortName: 'NEW', kit: kit('#232527', '#f2f2ee', 'black'), formation: '4-3-3', players: `
    Nick Pope, GK, 84, 1992, R
    Martin Dúbravka, GK, 76, 1989, R
    Sven Botman, CB, 81, 2000, L
    Fabian Schär, CB, 80, 1991, R
    Dan Burn, CB/FB, 78, 1992, L
    Jamaal Lascelles, CB, 74, 1993, R
    Lloyd Kelly, CB/FB, 74, 1998, L
    Emil Krafth, FB/CB, 72, 1994, R
    Kieran Trippier, FB, 81, 1990, R
    Tino Livramento, FB, 78, 2002, R
    Lewis Hall, FB, 76, 2004, L
    Bruno Guimarães, DM/CM, 85, 1997, R, Bruno Guimarães
    Sandro Tonali, CM/DM, 83, 2000, R
    Sean Longstaff, CM, 76, 1997, R
    Joelinton, CM/ST, 81, 1996, R
    Joe Willock, CM, 76, 1999, R
    Lewis Miley, CM, 70, 2006, R
    Anthony Gordon, W, 82, 2001, R
    Harvey Barnes, W, 78, 1997, R
    Miguel Almirón, W, 77, 1994, L
    Jacob Murphy, W/WM, 76, 1995, R
    Alexander Isak, ST, 85, 1999, R
    Callum Wilson, ST, 78, 1992, R
    William Osula, ST, 68, 2003, R
  ` },
  {
    club: 'Nottingham Forest', shortName: 'NFO', kit: kit('#dd0000', '#ffffff', 'red'), formation: '4-2-3-1', players: `
    Matz Sels, GK, 79, 1992, R
    Carlos Miguel, GK, 72, 1998, R, Carlos Miguel
    Murillo, CB, 81, 2002, L
    Nikola Milenković, CB, 81, 1997, R
    Morato, CB, 74, 2001, L
    Willy Boly, CB, 74, 1991, R
    Andrew Omobamidele, CB, 70, 2002, R
    Ola Aina, FB, 78, 1996, R
    Neco Williams, FB, 75, 2001, R
    Álex Moreno, FB, 75, 1993, L
    Harry Toffolo, FB, 72, 1995, L
    Ibrahim Sangaré, DM, 77, 1997, R
    Elliot Anderson, CM/DM, 79, 2002, R
    Ryan Yates, DM/CM, 77, 1997, R
    Danilo, CM, 75, 2001, R
    Nicolás Domínguez, CM, 75, 1998, R
    Morgan Gibbs-White, CM/W, 81, 2000, R
    Callum Hudson-Odoi, W, 78, 2000, R
    Anthony Elanga, W, 79, 2002, R
    Jota Silva, W, 73, 1999, R, Jota Silva
    Ramón Sosa, W, 72, 1999, R
    Chris Wood, ST, 80, 1991, R
    Taiwo Awoniyi, ST, 75, 1997, R
  ` },
  {
    club: 'Southampton', shortName: 'SOU', kit: kit('#d71920', '#111111', 'red'), formation: '4-3-3', players: `
    Aaron Ramsdale, GK, 80, 1998, R
    Alex McCarthy, GK, 72, 1989, R
    Taylor Harwood-Bellis, CB, 74, 2002, R
    Jan Bednarek, CB, 74, 1996, R
    Jack Stephens, CB, 72, 1994, R
    Nathan Wood, CB, 69, 2002, R
    Kyle Walker-Peters, FB, 76, 1997, R
    Yukinari Sugawara, FB, 74, 2000, R
    Ryan Manning, FB, 72, 1996, L
    Charlie Taylor, FB, 70, 1993, L
    James Bree, FB, 68, 1997, R
    Flynn Downes, DM, 74, 1999, R
    Lesley Ugochukwu, DM/CM, 72, 2004, R
    Joe Aribo, CM, 72, 1996, R
    Will Smallbone, CM, 70, 2000, R
    Mateus Fernandes, CM, 73, 2004, R, Mateus Fernandes
    Adam Lallana, CM, 72, 1988, R
    Kamaldeen Sulemana, W, 73, 2002, R
    Tyler Dibling, W/CM, 68, 2006, L
    Ben Brereton Díaz, W/ST, 72, 1999, R, Brereton Díaz
    Cameron Archer, ST, 72, 2001, R
    Paul Onuachu, ST, 73, 1994, R
    Adam Armstrong, ST, 72, 1997, R
  ` },
  {
    club: 'Tottenham Hotspur', shortName: 'TOT', kit: kit('#f2f2ee', '#1b2a4a', 'white'), formation: '4-3-3', players: `
    Guglielmo Vicario, GK, 83, 1996, R
    Fraser Forster, GK, 74, 1988, R
    Cristian Romero, CB, 84, 1998, R
    Micky van de Ven, CB, 82, 2001, L
    Radu Drăgușin, CB, 76, 2002, R
    Ben Davies, CB/FB, 76, 1993, L
    Pedro Porro, FB, 82, 1999, R
    Destiny Udogie, FB, 80, 2002, L
    Djed Spence, FB, 73, 2000, R
    Archie Gray, CM/FB, 72, 2006, R
    Yves Bissouma, DM/CM, 79, 1996, R
    Rodrigo Bentancur, CM/DM, 81, 1997, R
    Pape Matar Sarr, CM, 78, 2002, R
    Lucas Bergvall, CM, 70, 2006, R
    James Maddison, CM/W, 82, 1996, R
    Dejan Kulusevski, W/CM, 82, 2000, L
    Brennan Johnson, W, 78, 2001, R
    Son Heung-min, W/ST, 87, 1992, R, Son
    Timo Werner, W/ST, 76, 1996, R
    Wilson Odobert, W, 73, 2004, R
    Mikey Moore, W, 63, 2007, R
    Dominic Solanke, ST, 81, 1997, R
    Richarlison, ST/W, 79, 1997, R
  ` },
  {
    club: 'West Ham United', shortName: 'WHU', kit: kit('#7a263a', '#1bb1e7', 'red'), formation: '4-2-3-1', players: `
    Alphonse Areola, GK, 80, 1993, R
    Łukasz Fabiański, GK, 76, 1985, R
    Wes Foderingham, GK, 70, 1991, R
    Max Kilman, CB, 78, 1997, L
    Jean-Clair Todibo, CB, 79, 1999, R
    Konstantinos Mavropanos, CB, 76, 1997, R
    Aaron Wan-Bissaka, FB, 78, 1997, R
    Vladimír Coufal, FB, 76, 1992, R
    Emerson Palmieri, FB, 76, 1994, L, Emerson
    Aaron Cresswell, FB/CB, 74, 1989, L
    Edson Álvarez, DM/CB, 79, 1997, R
    Guido Rodríguez, DM, 78, 1994, R
    Tomáš Souček, CM/DM, 79, 1995, R
    Lucas Paquetá, CM/W, 82, 1997, L
    Carlos Soler, CM, 77, 1997, R
    Andy Irving, CM, 68, 2000, R
    Mohammed Kudus, W/CM, 81, 2000, L
    Jarrod Bowen, W/ST, 82, 1996, L
    Crysencio Summerville, W, 76, 2001, R
    Luis Guilherme, W, 68, 2006, L, Luis Guilherme
    Niclas Füllkrug, ST, 79, 1993, R
    Michail Antonio, ST, 76, 1990, R
    Danny Ings, ST, 73, 1992, R
  ` },
  {
    club: 'Wolverhampton Wanderers', shortName: 'WOL', kit: kit('#f0a81c', '#1b1f1c', 'yellow'), formation: '3-4-3', players: `
    José Sá, GK, 79, 1993, R
    Sam Johnstone, GK, 74, 1993, R
    Daniel Bentley, GK, 70, 1993, R
    Craig Dawson, CB, 74, 1990, R
    Toti Gomes, CB, 75, 1999, L, Toti
    Santiago Bueno, CB, 74, 1998, R
    Yerson Mosquera, CB, 73, 2001, R
    Nélson Semedo, FB, 77, 1993, R
    Matt Doherty, FB, 74, 1992, R
    Rayan Aït-Nouri, FB, 78, 2001, L
    Hugo Bueno, FB, 70, 2002, L
    Mario Lemina, DM/CM, 77, 1993, R
    André, DM, 76, 2001, R
    Boubacar Traoré, DM, 72, 2001, R
    João Gomes, CM/DM, 79, 2001, R, João Gomes
    Tommy Doyle, CM, 70, 2001, R
    Jean-Ricner Bellegarde, CM/W, 75, 1998, R
    Pablo Sarabia, W/CM, 75, 1992, L
    Hwang Hee-chan, W/ST, 78, 1996, R, Hwang
    Gonçalo Guedes, W, 75, 1996, R
    Rodrigo Gomes, W, 70, 2003, R, Rodrigo Gomes
    Carlos Forbs, W, 68, 2004, R
    Matheus Cunha, ST/W, 80, 1999, R
    Jørgen Strand Larsen, ST, 76, 2000, R, Strand Larsen
  ` },
]
