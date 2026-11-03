/**
 * Ligue 1 2024/25 for a real career: the eighteen clubs and their first-team squads at the end of the
 * summer window (1 September 2024; loans at the club they went to). One player a line:
 * `Name, POS[/POS…], overall, born, foot[, known as]`, spelled as in the draft's squads files;
 * overalls are our estimate of his EA FC 25 rating. See premier-league-2024.ts.
 */
import type { RealClub } from '../real.ts'
import { kit } from '../../draft/squads.ts'

export const SEASON = 2024

export const CLUBS: RealClub[] = [
  {
    club: 'Paris Saint-Germain', shortName: 'PSG', kit: kit('#1b2a4a', '#ffffff', 'blue'), formation: '4-3-3', players: `
    Gianluigi Donnarumma, GK, 89, 1999, R
    Matvey Safonov, GK, 76, 1999, R
    Arnau Tenas, GK, 69, 2001, R
    Marquinhos, CB, 86, 1994, R
    Willian Pacho, CB, 80, 2001, L
    Lucas Beraldo, CB/FB, 77, 2003, L
    Lucas Hernández, CB/FB, 84, 1996, L
    Milan Škriniar, CB, 82, 1995, R
    Presnel Kimpembe, CB, 78, 1995, L
    Achraf Hakimi, FB, 86, 1998, R
    Nuno Mendes, FB, 82, 2002, L
    Vitinha, CM/DM, 85, 2000, R
    João Neves, CM/DM, 82, 2004, R
    Fabián Ruiz, CM, 83, 1996, L
    Warren Zaïre-Emery, CM/FB, 80, 2006, R
    Danilo Pereira, DM/CB, 79, 1991, R
    Lee Kang-in, CM/W, 78, 2001, L, Lee
    Senny Mayulu, CM, 64, 2006, R
    Marco Asensio, W/CM, 79, 1996, L
    Ousmane Dembélé, W/ST, 86, 1997, L
    Bradley Barcola, W, 80, 2002, R
    Désiré Doué, W/CM, 77, 2005, R
    Gonçalo Ramos, ST, 81, 2001, R
    Randal Kolo Muani, ST, 81, 1998, R
  ` },
  {
    club: 'Marseille', shortName: 'OM', kit: kit('#f4f4f0', '#2fa4dc', 'white'), formation: '4-2-3-1', players: `
    Gerónimo Rulli, GK, 80, 1992, R
    Jeffrey de Lange, GK, 70, 1998, R
    Rubén Blanco, GK, 72, 1995, R
    Leonardo Balerdi, CB, 79, 1999, R
    Chancel Mbemba, CB, 79, 1994, R
    Lilian Brassier, CB, 75, 1999, L
    Derek Cornelius, CB, 73, 1998, L
    Amir Murillo, FB, 74, 1996, R
    Pol Lirola, FB, 73, 1997, R
    Quentin Merlin, FB, 74, 2002, L
    Ulisses Garcia, FB, 72, 1996, L
    Pierre-Emile Højbjerg, DM/CM, 80, 1995, R
    Geoffrey Kondogbia, DM, 77, 1993, L
    Valentin Rongier, CM, 78, 1994, R
    Ismaël Koné, CM, 74, 2002, R
    Azzedine Ounahi, CM, 75, 2000, R
    Bilal Nadir, CM, 70, 2003, R
    Amine Harit, CM/W, 76, 1997, R
    Mason Greenwood, W/ST, 79, 2001, L
    Luis Henrique, W, 75, 2001, L
    Jonathan Rowe, W, 72, 2003, R
    Elye Wahi, ST, 76, 2003, R
    Neal Maupay, ST, 74, 1996, R
    Faris Moumbagna, ST, 70, 2000, R
  ` },
  {
    club: 'Monaco', shortName: 'ASM', kit: kit('#d4111c', '#ffffff', 'red'), formation: '4-4-2', players: `
    Radosław Majecki, GK, 76, 1999, R
    Philipp Köhn, GK, 75, 1998, R
    Yann Liénard, GK, 62, 2003, R
    Thilo Kehrer, CB, 78, 1996, R
    Mohammed Salisu, CB, 77, 1999, L
    Wilfried Singo, CB/FB, 77, 2000, R
    Christian Mawissa, CB, 69, 2005, L
    Soungoutou Magassa, DM/CB, 72, 2003, L
    Vanderson, FB, 78, 2001, R
    Caio Henrique, FB, 77, 1997, L
    Jordan Teze, FB/CB, 75, 1999, R
    Kassoum Ouattara, FB, 69, 2004, L
    Denis Zakaria, DM, 79, 1996, R
    Lamine Camara, CM, 75, 2004, R
    Edan Diop, CM, 67, 2004, R
    Aleksandr Golovin, CM/W, 79, 1996, L
    Maghnes Akliouche, W/CM, 77, 2002, L
    Takumi Minamino, W/CM, 78, 1995, R
    Eliesse Ben Seghir, W, 76, 2005, L
    Krépin Diatta, W, 74, 1999, R
    Breel Embolo, ST, 76, 1997, R
    Folarin Balogun, ST, 76, 2001, R
    George Ilenikhena, ST, 69, 2006, R
  ` },
  {
    club: 'Lille', shortName: 'LOSC', kit: kit('#d0102b', '#ffffff', 'red'), formation: '4-2-3-1', players: `
    Lucas Chevalier, GK, 80, 2001, R
    Vito Mannone, GK, 66, 1988, R
    Marc-Aurèle Caillard, GK, 63, 1994, R
    Bafodé Diakité, CB, 77, 2001, R
    Alexsandro, CB, 78, 1999, L
    Aïssa Mandi, CB, 75, 1991, R
    Tiago Santos, FB, 76, 2002, R
    Thomas Meunier, FB, 75, 1991, R
    Gabriel Gudmundsson, FB, 75, 1999, L
    Ismaily, FB, 72, 1990, L
    Mitchel Bakker, FB, 72, 2000, L
    Benjamin André, DM, 79, 1990, R
    Ayyoub Bouaddi, DM, 68, 2007, R
    André Gomes, CM, 76, 1993, R
    Ngal'ayel Mukau, CM, 68, 2004, R
    Ethan Mbappé, CM, 70, 2006, L
    Angel Gomes, CM, 77, 2000, R
    Rémy Cabella, CM/W, 76, 1990, R
    Edon Zhegrova, W, 79, 1999, L
    Osame Sahraoui, W, 74, 2001, R
    Hákon Arnar Haraldsson, CM/W, 76, 2003, R
    Matías Fernández-Pardo, W, 70, 2005, R
    Jonathan David, ST, 82, 2000, R
  ` },
  {
    club: 'Nice', shortName: 'OGCN', kit: kit('#c8102e', '#111111', 'red'), formation: '4-3-3', players: `
    Marcin Bułka, GK, 81, 1999, R
    Maxime Dupé, GK, 68, 1993, R
    Teddy Boulhendi, GK, 62, 2001, R
    Dante, CB, 76, 1983, L
    Moïse Bombito, CB, 75, 2000, R
    Youssouf Ndayishimiye, CB/DM, 75, 1998, R
    Jonathan Clauss, FB, 78, 1992, R
    Melvin Bard, FB, 75, 2000, L
    Antoine Mendy, FB, 70, 2004, R
    Ali Abdi, FB, 70, 1993, L
    Hicham Boudaoui, DM/CM, 75, 1999, R
    Pablo Rosario, DM, 74, 1997, R
    Tanguy Ndombele, CM, 75, 1996, R
    Morgan Sanson, CM, 75, 1994, L
    Tom Louchet, CM, 68, 2003, R
    Sofiane Diop, CM/W, 76, 2000, R
    Jérémie Boga, W, 76, 1997, R
    Mohamed-Ali Cho, W, 74, 2004, L
    Badredine Bouanani, W, 70, 2004, L
    Gaëtan Laborde, ST, 76, 1994, L
    Evann Guessand, ST, 75, 2001, R
    Terem Moffi, ST, 77, 1999, R
    Victor Orakpo, ST, 64, 2003, R
  ` },
  {
    club: 'Lyon', shortName: 'OL', kit: kit('#f4f4f0', '#1d3c8f', 'white'), formation: '4-2-3-1', players: `
    Lucas Perri, GK, 78, 1997, R
    Rémy Descamps, GK, 68, 1996, R
    Justin Bengui, GK, 62, 2005, R
    Duje Ćaleta-Car, CB, 76, 1996, R
    Moussa Niakhaté, CB, 78, 1996, L
    Clinton Mata, CB/FB, 75, 1992, R
    Nicolás Tagliafico, FB, 78, 1992, L
    Abner, FB, 75, 2000, L
    Ainsley Maitland-Niles, FB/CM, 72, 1997, R
    Saël Kumbedi, FB, 70, 2005, R
    Nemanja Matić, DM, 76, 1988, L
    Jordan Veretout, CM, 77, 1993, R
    Corentin Tolisso, CM, 77, 1994, R
    Maxence Caqueret, CM, 77, 2000, R
    Tanner Tessmann, CM, 72, 2001, R
    Rayan Cherki, CM/W, 79, 2003, R
    Ernest Nuamah, W, 75, 2003, R
    Malick Fofana, W, 76, 2005, R
    Saïd Benrahma, W, 76, 1995, R
    Wilfried Zaha, W, 76, 1992, R
    Alexandre Lacazette, ST, 79, 1991, R
    Georges Mikautadze, ST, 76, 2000, R
    Gift Orban, ST, 72, 2002, R
  ` },
  {
    club: 'Strasbourg', shortName: 'RCSA', kit: kit('#1d6fc2', '#ffffff', 'blue'), formation: '4-2-3-1', players: `
    Đorđe Petrović, GK, 78, 1999, R
    Karl-Johan Johnsson, GK, 70, 1990, R
    Alaa Bellaarouch, GK, 64, 2002, R
    Andrew Omobamidele, CB, 72, 2002, R
    Abakar Sylla, CB, 73, 2002, R
    Ismaël Doukouré, CB, 73, 2003, R
    Mamadou Sarr, CB, 72, 2005, R
    Saïdou Sow, CB, 70, 2002, R
    Guéla Doué, FB/CB, 74, 2002, R
    Caleb Wiley, FB, 68, 2004, L
    Diego Moreira, WM/FB, 74, 2004, R
    Habib Diarra, CM, 76, 2004, R
    Andrey Santos, CM/DM, 77, 2004, R
    Félix Lemaréchal, CM, 70, 2003, R
    Pape Diong, DM, 66, 2006, R
    Junior Mwanga, CM, 68, 2003, R
    Rabby Nzingoula, CM, 64, 2005, R
    Sebastian Nanasi, W/CM, 74, 2002, R
    Dilane Bakwa, W, 76, 2002, L
    Abdoul Ouattara, W, 66, 2005, R
    Emanuel Emegha, ST, 75, 2003, R
    Moïse Sahi, ST, 64, 2005, R
  ` },
  {
    club: 'Lens', shortName: 'RCL', kit: kit('#f6d20e', '#c8102e', 'yellow'), formation: '3-4-3', players: `
    Brice Samba, GK, 81, 1994, R
    Hervé Koffi, GK, 70, 1996, R
    Denis Petrić, GK, 66, 1988, R
    Kevin Danso, CB, 79, 1998, R
    Jonathan Gradit, CB, 74, 1992, R
    Facundo Medina, CB, 77, 1999, L
    Abdukodir Khusanov, CB, 72, 2004, R
    Przemysław Frankowski, FB/WM, 76, 1995, R
    Deiver Machado, FB, 74, 1993, L
    Ruben Aguilar, FB, 74, 1993, R
    Jhoanner Chávez, FB, 70, 2002, L
    Andy Diouf, CM, 76, 2003, L
    Nampalys Mendy, DM, 72, 1992, R
    Neil El Aynaoui, CM, 72, 2001, R
    Hamzat Ojediran, CM, 68, 2003, R
    Adrien Thomasson, CM/W, 76, 1993, R
    Angelo Fulgini, CM, 74, 1996, R
    Rémy Labeau Lascary, W, 68, 2003, R
    Florian Sotoca, W/ST, 75, 1990, R
    Wesley Saïd, ST, 72, 1995, R
    M'Bala Nzola, ST, 74, 1996, L
    Martín Satriano, ST, 72, 2001, R
  ` },
  {
    club: 'Brest', shortName: 'SB29', kit: kit('#e3001b', '#ffffff', 'red'), formation: '4-3-3', players: `
    Marco Bizot, GK, 77, 1991, R
    Grégoire Coudert, GK, 64, 1999, R
    Noah Jauny, GK, 62, 2003, R
    Brendan Chardonnet, CB, 74, 1994, L
    Abdoulaye Ndiaye, CB, 72, 1998, R
    Julien Le Cardinal, CB/FB, 71, 1997, R
    Soumaïla Coulibaly, CB, 70, 2003, L
    Kenny Lala, FB, 73, 1991, R
    Bradley Locko, FB, 72, 2002, L
    Massadio Haïdara, FB, 70, 1992, L
    Pierre Lees-Melou, DM/CM, 76, 1993, R
    Mahdi Camara, CM/DM, 75, 1998, R
    Hugo Magnetti, CM, 72, 1998, R
    Edimilson Fernandes, CM, 74, 1996, R
    Kamory Doumbia, CM/W, 70, 2003, R
    Romain Del Castillo, W, 76, 1996, L
    Mathias Pereira Lage, W, 73, 1996, R
    Abdallah Sima, W, 74, 2001, R
    Ibrahim Salah, W, 70, 2001, R
    Romain Faivre, W/CM, 73, 1998, L
    Mama Baldé, W, 72, 1995, R
    Ludovic Ajorque, ST, 75, 1994, L
  ` },
  {
    club: 'Toulouse', shortName: 'TFC', kit: kit('#5b2a86', '#ffffff', 'purple'), formation: '3-4-3', players: `
    Guillaume Restes, GK, 76, 2005, R
    Álex Domínguez, GK, 66, 1998, R
    Kjetil Haug, GK, 66, 1998, R
    Rasmus Nicolaisen, CB, 75, 1997, R
    Charlie Cresswell, CB, 72, 2002, R
    Mark McKenzie, CB, 74, 1999, R
    Ümit Akdağ, CB, 72, 2003, L
    Dayann Methalie, CB, 64, 2005, R
    Warren Kamanzi, FB, 72, 2001, R
    Gabriel Suazo, FB, 74, 1997, L
    Djibril Sidibé, FB, 72, 1992, R
    Aron Dønnum, W/FB, 74, 1998, R
    Vincent Sierro, CM, 75, 1995, R
    Cristian Cásseres Jr., CM, 74, 2000, R
    Miha Zajc, CM, 72, 1994, L
    Denis Genreau, CM, 70, 1999, R
    Jaydee Canvot, CB/DM, 64, 2006, R
    Naatan Skyttä, CM/W, 68, 2002, R
    Niklas Schmidt, CM, 72, 1998, L
    Yann Gboho, W, 72, 2001, R
    Zakaria Aboukhlal, W, 74, 2000, R
    Shavy Babicka, W, 68, 2000, R
    Frank Magri, ST, 70, 1999, R
    Joshua King, ST, 72, 1992, R
  ` },
  {
    club: 'Auxerre', shortName: 'AJA', kit: kit('#f4f4f0', '#1d4fa0', 'white'), formation: '3-5-2', players: `
    Donovan Léon, GK, 72, 1992, R
    Théo De Percin, GK, 66, 2001, R
    Raphaël Adiceam, GK, 62, 2000, R
    Jubal, CB, 74, 1993, R
    Gabriel Osho, CB, 72, 1998, R
    Clément Akpa, CB, 69, 2001, R
    Sinaly Diomandé, CB, 73, 2001, R
    Paul Joly, FB, 70, 2000, R
    Ki-Jana Hoever, FB, 72, 2002, R
    Théo Pellenard, FB, 67, 1994, L
    Madiou Keïta, CB, 64, 2004, R
    Rayan Raveloson, CM/FB, 70, 1996, R
    Elisha Owusu, DM, 72, 1997, R
    Assane Diousse, DM, 69, 1997, R
    Lasso Coulibaly, CM, 69, 2002, R
    Kévin Danois, CM, 70, 2004, R
    Hamed Junior Traorè, CM/W, 74, 2000, R
    Gaëtan Perrin, CM/W, 74, 1996, L
    Lassine Sinayoko, W/ST, 74, 1999, R
    Ado Onaiwu, ST/W, 70, 1995, R
    Florian Ayé, ST, 69, 1997, R
    Théo Bair, ST, 68, 1999, R
  ` },
  {
    club: 'Rennes', shortName: 'SRFC', kit: kit('#d81e2a', '#111111', 'red'), formation: '4-4-2', players: `
    Steve Mandanda, GK, 77, 1985, R
    Gauthier Gallon, GK, 70, 1993, R
    Doğan Alemdar, GK, 68, 2002, R
    Christopher Wooh, CB, 72, 2001, R
    Warmed Omari, CB, 74, 2000, R
    Leo Østigård, CB, 74, 1999, R
    Mikayil Faye, CB, 70, 2004, L
    Alidu Seidu, CB/FB, 73, 2000, R
    Lorenz Assignon, FB, 74, 2000, R
    Adrien Truffert, FB, 77, 2001, L
    Hans Hateboer, FB, 74, 1994, R
    Azor Matusiwa, DM, 74, 1998, R
    Baptiste Santamaria, DM/CM, 77, 1995, L
    Seko Fofana, CM, 78, 1995, R
    Glen Kamara, CM, 74, 1995, R
    Jordan James, CM, 70, 2004, R
    Djaoui Cissé, CM, 70, 2004, R
    Albert Grønbæk, CM, 70, 2001, R
    Ludovic Blas, WM/CM, 77, 1997, L
    João Pedro Neves Filipe, W, 72, 1999, L, Jota
    Martin Terrier, ST/W, 80, 1997, R
    Amine Gouiri, ST/W, 80, 2000, R
    Arnaud Kalimuendo, ST, 77, 2002, R
    Mohamed Kader Meïté, ST, 66, 2007, R
  ` },
  {
    club: 'Nantes', shortName: 'FCN', kit: kit('#f7d40a', '#0e7a3a', 'yellow'), formation: '4-2-3-1', players: `
    Alban Lafont, GK, 77, 1999, R
    Anthony Lopes, GK, 76, 1990, L
    Patrik Carlgren, GK, 68, 1992, R
    Jean-Charles Castelletto, CB, 72, 1995, R
    Nicolas Pallois, CB, 72, 1987, L
    Jean-Kévin Duverne, CB, 72, 1997, R
    Nathan Zézé, CB, 66, 2005, R
    Kelvin Amian, FB/CB, 72, 1998, R
    Fabien Centonze, FB, 72, 1996, R
    Nicolas Cozza, FB, 70, 1999, L
    Sorba Thomas, W/FB, 72, 1999, L
    Pedro Chirivella, DM, 72, 1997, R
    Douglas Augusto, CM, 73, 1997, R
    Johann Lepenant, CM, 72, 2002, R
    Louis Leroux, CM, 64, 2004, R
    Florent Mollet, CM, 72, 1991, R
    Moses Simon, W, 76, 1995, R
    Marcus Coco, W, 70, 1996, R
    Dehmaine Assoumani, W, 64, 2005, R
    Matthis Abline, ST, 72, 2003, R
    Mostafa Mohamed, ST, 73, 1997, R
    Tino Kadewere, ST, 70, 1996, R
    Ignatius Ganago, ST, 70, 1999, R
    Bahereba Guirassy, ST, 64, 2003, R
  ` },
  {
    club: 'Angers', shortName: 'SCO', kit: kit('#1d1d1b', '#ffffff', 'black'), formation: '3-5-2', players: `
    Yahia Fofana, GK, 72, 2000, R
    Melvin Zinga, GK, 62, 2004, R
    Ousmane Camara, CB, 66, 2003, R
    Jordan Lefort, CB, 72, 1993, L
    Cédric Hountondji, CB, 70, 1994, L
    Abdoulaye Bamba, CB/FB, 68, 1990, R
    Emmanuel Biumla, CB, 66, 2002, R
    Lilian Raolisoa, FB, 66, 2000, R
    Carlens Arcus, FB, 70, 1996, R
    Jacques Ekomié, FB, 68, 2003, L
    Florent Hanin, FB, 68, 1990, L
    Haris Belkebla, DM, 70, 1994, R
    Jean-Eudes Aholou, CM/DM, 70, 1994, L
    Zinédine Ould Khaled, CM, 70, 2000, R
    Yassin Belkhdim, CM, 68, 2002, R
    Pierrick Capelle, CM/FB, 70, 1987, L
    Himad Abdelli, CM, 74, 1999, R
    Farid El Melali, W, 70, 1997, R
    Jim Allevinah, W, 70, 1995, R
    Zinedine Ferhat, W, 70, 1993, R
    Esteban Lepaul, ST, 70, 2000, R
    Ibrahima Niane, ST, 68, 1999, R
    Lois Diony, ST, 69, 1992, R
    Sidiki Chérif, ST, 64, 2006, R
  ` },
  {
    club: 'Le Havre', shortName: 'HAC', kit: kit('#1b3f6e', '#7ab8e8', 'blue'), formation: '4-3-3', players: `
    Arthur Desmas, GK, 72, 1994, R
    Mathieu Gorgelin, GK, 68, 1990, R
    Gautier Lloris, CB, 70, 1995, R
    Arouna Sangante, CB, 71, 2002, R
    Yoann Salmier, CB, 70, 1992, R
    Etienne Youte Kinkoue, CB, 70, 2002, R
    Mathéo Bodmer, CB/DM, 64, 2006, R
    Loïc Nego, FB, 72, 1991, R
    Christopher Operi, FB, 70, 1997, L
    Yanis Zouaoui, FB, 66, 2003, L
    Timothée Pembélé, FB, 68, 2002, R
    Daler Kuzyaev, CM, 72, 1993, R
    Rassoul Ndiaye, CM, 70, 2001, R
    Yassine Kechta, CM, 70, 2002, L
    Oussama Targhalline, DM, 70, 2002, R
    Ismaïl Bouneb, CM, 64, 2005, R
    Antoine Joujou, W, 68, 2003, R
    Josué Casimir, W, 70, 2001, R
    Abdoulaye Touré, W, 66, 2004, R
    Samuel Grandsir, W, 69, 1996, R
    Issa Soumaré, ST, 69, 2000, R
    Emmanuel Sabbi, ST, 68, 1997, R
    Steve Ngoura, ST, 66, 2005, R
    Kandet Diawara, ST, 64, 2004, R
  ` },
  {
    club: 'Reims', shortName: 'SDR', kit: kit('#d0112b', '#ffffff', 'red'), formation: '4-3-3', players: `
    Yehvann Diouf, GK, 76, 1999, R
    Alexandre Olliero, GK, 66, 1996, R
    Ludovic Butelle, GK, 62, 1983, R
    Emmanuel Agbadou, CB, 76, 1997, R
    Joseph Okumu, CB, 74, 1997, R
    Cédric Kipré, CB, 72, 1996, R
    Abdoul Koné, CB, 66, 2005, R
    Aurélio Buta, FB, 72, 1997, R
    Sergio Akieme, FB, 72, 1997, L
    Thibault De Smet, FB, 70, 1998, L
    Hiroki Sekine, CB/FB, 66, 2002, R
    Nhoa Sangui, FB, 64, 2006, L
    Marshall Munetsi, CM/DM, 75, 1996, R
    Teddy Teuma, CM, 75, 1993, R
    Valentin Atangana Edoa, DM, 69, 2005, R
    Amadou Koné, CM, 68, 2005, R
    Yaya Fofana, CM, 66, 2004, R
    Gabriel Moscardo, DM, 66, 2005, R
    Junya Ito, W, 77, 1993, R
    Keito Nakamura, W, 75, 2000, R
    Mamadou Diakhon, W, 64, 2005, R
    Oumar Diakité, ST/W, 72, 2003, R
    Amine Salama, ST, 68, 2000, R
    Reda Khadra, W, 68, 2001, R
  ` },
  {
    club: 'Saint-Étienne', shortName: 'ASSE', kit: kit('#0b7a3e', '#ffffff', 'green'), formation: '4-3-3', players: `
    Gautier Larsonneur, GK, 72, 1997, R
    Issiaka Touré, GK, 60, 2005, R
    Yunis Abdelhamid, CB, 74, 1987, R
    Dylan Batubinsika, CB, 70, 1996, R
    Léo Pétrot, CB/FB, 68, 1997, L
    Mickaël Nadé, CB, 68, 1999, R
    Kévin Pedro, CB, 64, 2004, R
    Pierre Cornud, FB, 68, 1996, L
    Dennis Appiah, FB, 69, 1992, R
    Yvann Maçon, FB, 66, 1998, R
    Florian Tardieu, DM, 70, 1992, R
    Pierre Ekwah, DM, 70, 2002, R
    Mathis Amougou, CM, 66, 2006, R
    Benjamin Bouchouari, CM, 70, 2001, R
    Aïmen Moueffek, CM, 66, 2001, R
    Lamine Fomba, CM, 68, 1998, R
    Louis Mouton, CM, 66, 2002, R
    Ben Old, W/CM, 68, 2002, L
    Zuriko Davitashvili, W, 73, 2001, L
    Mathieu Cafaro, W/CM, 69, 1997, L
    Ibrahim Sissoko, ST, 69, 1995, R
    Lucas Stassin, ST, 72, 2004, R
    Augustine Boakye, W, 66, 2000, R
    Ibrahima Wadji, ST, 66, 1995, R
  ` },
  {
    club: 'Montpellier', shortName: 'MHSC', kit: kit('#1b2c5c', '#f08a24', 'blue'), formation: '4-2-3-1', players: `
    Benjamin Lecomte, GK, 74, 1991, R
    Dimitry Bertaud, GK, 68, 1998, R
    Modibo Sagnan, CB, 71, 1999, R
    Becir Omeragic, CB, 71, 2002, R
    Nikola Maksimović, CB, 70, 1991, R
    Boubakar Kouyaté, CB, 71, 1997, L
    Falaye Sacko, FB, 70, 1995, R
    Issiaga Sylla, FB, 70, 1994, L
    Enzo Tchato, FB, 66, 2002, R
    Théo Sainte-Luce, FB, 66, 1998, L
    Jordan Ferri, CM, 72, 1992, R
    Joris Chotard, DM, 72, 2001, R
    Khalil Fayad, CM, 68, 2004, L
    Birama Touré, CM, 66, 1992, R
    Stefan Džodić, CM, 64, 2004, R
    Gabriel Bares, CM, 66, 2000, L
    Téji Savanier, CM, 76, 1991, R
    Musa Al-Taamari, W, 74, 1997, L
    Arnaud Nordin, W, 72, 1998, R
    Wahbi Khazri, W/ST, 72, 1991, R
    Tanguy Coulibaly, W, 66, 2001, R
    Akor Adams, ST, 72, 2000, R
    Othmane Maamma, W, 64, 2005, L
  ` },
]
