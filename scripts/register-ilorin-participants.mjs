import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDxuVvc5rqOSAxvguUzosw86EmtKWK3zvo",
  authDomain: "fma-registration.firebaseapp.com",
  projectId: "fma-registration",
  storageBucket: "fma-registration.firebasestorage.app",
  messagingSenderId: "580637874716",
  appId: "1:580637874716:web:688ad61225f4bbd5c49dd9",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const RAW_DATA = `Abayomi Aluko	alukoman360@gmail.com
Abiola Ayinde	abiolaolamiposi0@gmail.com
Abiola Olatoye	olatoyeabiolamoses@gmail.com
Abiola Oludare Adejimi	adejimi.abiola@gmail.com
Abodunrin Dayo Bukola 	dayobukola3@gmail.com
ABIDOYE KEHINDE SAMUEL 	abidoyesamuelk@gmail.com
Adedotun Tomiwa Samuel	agbejetomiwa@gmail.com
Adegboye Victoria Titilayo	victoriadegboye@gmail.com
Adeniji Esther Ibukun 	motunrayonioluwa32@gmail.com
Adenike Eniola Adeyemi	patriciaeniola6@gmail.com
Adeniran Sulaimon Oluwaseyi Adebambo	adeniranme@gmail.com
Adeoluwa Paul OYEDUN 	apoyedun@gmail.com
Adesewa Bagi	adesewabagi@gmail.com
Adesola Oyinloye	Desolaxplore@gmail.com
Adetoye Adewoye 	adetoyeadewoye@gmail.com
Adetunji ogunyemi jacob	ogunyemiadetunji17@gmail.com
Adubi Bolatito Adeola 	adubibola77@gmail.com
Aduralere Opadotun	opadotunaduraleremartha@gmail.com
ADEDOLAPO VICTORIA AWODELE 	haddyvyk@gmail.com
Agbana Ayobami Oluwaseun 	ayobamiagbana27@gmail.com
Ajibade Motunrayo	muftaumotunrayo007@gmail.com
Ajijola  Promise Olalekan 	promiseajijola08@gmail.com
Akande Sarah Ozohu	ozohu2016@gmail.com
Akinloye Blessing Mayowa 	akinloyeblessing23@gmail.com
Akinola  Ajao	hollyboyakb@icloud.com
Akinsola Oluwaseyi Lydia 	akinsolaoluwaseyi829@gmail.com
Alugo Olamilekan Phillip	lekanalugo@gmail.com
Andy Emmanuel William-Ubong	williamubongandy@gmail.com
Anjolajesu Adewoye	anjolaadunbi@gmail.com
AnjolaOluwa Oluwagbope Adetayo	anjolaoluwadetayo@gmail.com
Anthony Ekundayo	ekundayoanthony@gmail.com
Anuoluwa Odetundun 	anuodetundun@gmail.com
Anuoluwapo Adenuga	festusadenuga@gmail.com
Anyanwu Favour	chmfavor@gmail.com
Aransiola Samuel Oluwatobi 	tobitall01@gmail.com
Awotayo Samuel Ayobami	sammy4gsus@gmail.com
Ayobamidele Owolabi 	bamideleayo214@gmail.com
Ayodele Adesina	shina2011@gmail.com
Ayodele Davids Oluwaseye	absoluteoffice2000@gmail.com
Ayodele Deborah	dominicdeborahh@gmail.com
Ayomide Aina	ainaayomide96@gmail.com
Babatunde Mahmud	officialbmw39@gmail.com
Balogun Oluwatumininu Toluwanimi 	baloguntumi19@gmail.com
Bankole Korede 	korede.bankole01@gmail.com
Benjamin Olayiwola	olayiwolabenny1@yahoo.com
Bidemi Tenabe	tenabe.bidemi@gmail.com
Bolaji Folarin	charisfolarin@gmail.com
Bolatito Fayode 	johnblessedme@gmail.com
Boluwatife Obalugemo Rebecca	boluwatifeobalugemo@gmail.com
Bukunmi Oni	Bukunmikola@gmail.com
Buraimoh Ayooluwa Joseph	ayooluwa84@gmail.com
Cole Korede Abigail	abigailkorede3@gmail.com
Cole Michael Oluwaseun 	cmvicts@gmail.com
Damilola Adegbola	damadegb@gmail.com
Damilola Gift Adelokun	adelokundamilola14@gmail.com
David Odu	Odu.timilehin@gmail.com
David Ogboja	officialdavidabayomi@gmail.com
Deborah Adeniran 	deborahoruta@gmail.com
Deborah Adesina	adesina.deby@gmail.com
Deborah Oloyede	deboraholoyede77@gmail.com
Ebun Amurawaiye	ebunamurawaiye14@gmail.com
Efemuaye Eyimofe Igbunuroghene	eyimofeay@gmail.com
Ekundayo Deborah 	ekundayoolamide35@gmail.com
Emmanuel Nkiruka	emmanuelnkiruka090@gmail.com
EMMANUEL OGUNBAMOWO	demeraldchamp@gmail.com
EMMANUEL SAMUELS AWODELE	awodeleesam@gmail.com
Eniola Bamidele	bamideleeniola333@gmail.com
Esther	adesholafadumo@gmail.com
Esther Jones	ebulejonuesther@gmail.com
Esther Olayinka Abiodun	abbeyesty07@gmail.com
Esther Oluchi Israel-Olawepo	estygold226@gmail.com
Eyitayo Isaac Adefila	isaacntruth@gmail.com
EZEKIEL JEGEDE	jegederichards@gmail.com
Falowo Rachael Olaitan 	ameezat95@gmail.com
Fatima Adeyemi	fatmaad620@gmail.com
Favourite Kelechi Godspower	favourgodspower187@gmail.com
Femi Elisha	adeyemiefemi@gmail.com
Festus Adeyemo	festusadeyemore@gmail.com
Fidelis Odianosen Throne	thronefidelis@gmail.com
Fiyinfoluwa Ololade Salisu	fiyinsalisu96@gmail.com
Folashade Lois James	folashadeloisjames@gmail.com
FOLAYAN OLUWAFUNMILAYO	folayanfunmilayo9@gmail.com
Funmilola Esther Adeyemi 	Virtuosity07@gmail.com
Gabriel Oluwole 	pstgabrieloluwole@gmail.com
Geoffrey Atiko	wetageoffrey@gmail.com
Happiness Adaobi Olumorin	happinessadao@gmail.com
Hopeabby Onuh	hopeonuh12@gmail.com
Idigbe Bright	brightidigbe3@gmail.com
Idowu-Solomon OGUNSEMORE	idowusolomonogunsemore@gmail.com
Ifeoluwa Deborah Adegbola	ifeoluwadeborahadegbola@gmail.com
Ikele Samuel Uchechukwu	ikelesamuel@gmail.com
Ipinyomi David Boluwatife 	davidipinyomi@gmail.com
Isaac Oladimeji	isaacoladimeji12@gmail.com
Iseoluwa Ige	igeoluwatominsin82@gmail.com
Israel Amusan	amusanisrael1@gmail.com
Jaiyeoba Elizabeth Arinola	elizabetharionola54@gmail.com
James Ihima 	jamexamuel19@gmail.com
James Oluwatosin Opatola	opatolajamesoluwatosin@gmail.com
Janet Akinloye 	janeakinloye@gmail.com
Janet Oluseri	toluseri.jt@gmail.com
Jeremiah James	folashadeloisjames@gmail.com
Jesupemi Eleazar, ANOTA	jesupemianota1998@gmail.com
John Jacob 	jacob619j@gmail.com
John Segun Monday 	johnsegunmonday95@gmail.com
Johnson Onyeka Davids	davidsjohnson70@gmail.com
Josephine Oluseyi Adebayo	josephineoluseyi.clc@gmail.com
Joshua Mark Onimisi	onimisimark9@gmail.com
Joshua Olanrewaju	olanrewajujoshua@gmail.com
Joshua Raphael 	Raphaeljoshua26@gmail.com
Kayode Adekeye	olukayodeadekeye@gmail.com
Kayode David Oluwafemi	kayodeoluwafemi19@gmail.com
Komolafe Oluwatunmise Esther	smarthandsreach@gmail.com
Makanjuola Abraham Mercy 	abrahammercy662@gmail.com
Makinde Adegboro	mak.adegboro@gmail.com
Manuwa Praise	tobypraise@gmail.com
Mary Ayo-Aina	maryayo.aina@gmail.com
Maryann Aloso 	agihmaryann@gmail.com
Mathias Gold	iamgoldmathais@gmail.com
MATTHEW ISAAC OLUSAYO	matthewisaacnewton@gmail.com
Mercy Eberechukwu 	mercyeberechukwu1@gmail.com
Monehin Agala 	monehinajigboye@gmail.com
Motolani Afolayanka	motolaniafolayanka@gmail.com
Nerry Koukoui	knerryasyncrite@gmail.com
Nsikakabasi Essien	nsikakabasiidongesit@gmail.com
okunloye Miracle	miracleokunloye@gmail.com
Obasohan Godwin	godwinobas22@gmail.com
Odunayo Oladepo	officialoladepo@gmail.com
Ogboja Deborah Atinuke	abayomideborah360@gmail.com
Ogu-Egege	graceegege@gmail.com
Ogungbemi Opeyemi Grace	graceopeyemi98@gmail.com
OGIE SAMUEL OSAGIE 	ogiesami02@gmail.com
Ojadovwa Rita Eseoghene	ojadoveseoghene@gmail.com
Okhide Oluwatosin Alice 	okhideoluwatosin@gmail.com
Okolie Amarachi Victoria 	okolievictoria734@gmail.com
OKHIDE OSAKPOLOR MOSES	okhidemoses@gmail.com
Olamuyide Michael Sola	Olamuyidemichaelsola@gmail.com
Olaniyi Aanuoluwapo 	maygueen0813@gmail.com
Olaoluwa God'sgift Ademola 	giftolade2018@gmail.com
Olasunkanmi Ridwan B.	olasunkanmir12@gmail.com
Olawepo Olaide	olaidevaughan@gmail.com
Olawunmi ADENUGA	olawunmianuadenuga@gmail.com
Olayemi Ifeoluwa Esther	olayemiifeoluwaesther@gmail.com
Oloke Bridget 	olokebridget@gmail.com
Oloke Jerry Ayobami 	olokejerry@gmail.com
Olorunwumi Toluwalase James	olorunwumitoluwalase4@gmail.com
Olufeagba Dotun Peters	dotunolufe@gmail.com
Oluwabukunmi Hannah Olaopa	oluwabukunmiolaopa@gmail.com
Oluwadamilola Adeyemi 	damilolaadeyemi767@gmail.com
Oluwakemi Akintola	akintolakemi01@gmail.com
Oluwaseun Mide-Adegbite	kuyoroseyi@yahoo.com
Oluwashola Olagbemisoye	shola.mich.7438@gmail.com
Oluwatobiloba David	oluwatobilobadavid728@gmail.com
Oluwatomiwa Samuel Adeshina	brandingbytom@gmail.com
Oluwatumininu Ayooluwa Ige 	oluwatumininuayooluwa@gmail.com
Oluwayemisi Fagboro	fagboroyemisi@gmail.com
Oluwole Eunice	oluwoleunice301@gmail.com
OLUWATOSIN OLUWAPONLE	stephenoluwaponle@gmail.com
Omobola Eniola Paimo	omobolapaimo98@gmail.com
Omolara Yusuf	Omolaray968@gmail.com
Omonide Fagunwa 	omonidefagunwa@gmail.com
ONI, Tolulope Modupe 	tolulope1ng@yahoo.com
Oreoluwa Isaac odetola	oreodetola@gmail.com
Osayiwu Glory Osagieoduwa 	glory.osayiwu@gmail.com
Oyedeji Olamide Joseph	oyedejiolamide342@gmail.com
Oyemakinde Sinmiloluwa 	oyemakindesinmiloluwa@gmail.com
Oyetoyan Adetola 	linktola@gmail.com
Ozenua Oluwatobi John	ozenuaoluwatobi@gmail.com
Pamilerin Olaniyi 	timiiniyii@gmail.com
Patience Babatunde-Alagbe 	khobe.patience@gmail.com
Paul Perfect	paulperfect10@gmail.com
Peace Lawrence	loripace98@gmail.com
Peter Adeniran	adeniranpeter29@gmail.com
Phebe Folorunso	phebe.folorunso8637@gmail.com
Phoebe Agbenike	phoebeagbenike@gmail.com
Precious Adedotun	pee_bod@yahoo.com
Priscilla Solomon Lasisi	priscillalasisi9@gmail.com
Rebecca Oladipupo	oladipuporebecca5@gmail.com
Rhoda Kolo 	rhodakolo@gmail.com
Richard Akande	richybossking@gmail.com
Semilore Afolayanka 	afolayankasemilore@gmail.com
Simon Tolulope Salawu 	salawusimon3@gmail.com
Sophia Olanrewaju	sophieododo@gmail.com
Soyebo Oluwatimileyin	timileyinsoyebo@gmail.com
Susan Olubunmi	susanolubunmi4@gmail.com
Taiwo Enitiafe Olaiya 	faithwalk.taiwo@gmail.com
Temi S. Adejumo	osarumwensesweet@gmail.com
Temiloluwa Bukoye	bukoyetemiloluwa@gmail.com
Temiloluwa Paul Joseph 	temijoeey03@gmail.com
Temitope Oladiran	temifash2@gmail.com
Temitope Timileyin Ajewole	Ajewoletemitope70@gmail.com
Testimony Adebiyi	adebiyitestimonya@gmail.com
TEYUI RUTH MAMEYI 	teyuiruth2@gmail.com
Timileyin Adejumoke Stella	stellaadejumoke25@gmail.com
Titilola Oluwadamilola Faseun 	titilola.fash@gmail.com
Toba Victor Adigun	tovastoba001@gmail.com
Tolu Eledah	tolueledah12@gmail.com
Tolu Naomi Ibitoye 	dunmininutolu@gmail.com
TOBECHUKWU BLESSING BENJAMIN	tobepraise3@gmail.com
TONY OLASUNBO	thetonysams@gmail.com
Udochukwu Michael Okereke	okerekeudm16@gmail.com
Umar Muneerah Ajeka 	umarmuneerah@gmail.com
Victory Bemdoo Atsua 	bemdooatsua@gmail.com
Victory Splendour Akpebe-Edward	akpebeedwardvictory@gmail.com
winner idigbe	winneridigbe@gmail.com
Wete nouyep Hildegard 	nouhilde@gmail.com
Happy Samuel Hedima	happysamuel9@gamil.com
Happiness Samuel Ufedo	happyspacegirl2024@gmail.com
Ojo-olufemi Victory Opemipo	opemipovictory@gmail.com
Solomon Favour Zubechi	seedsolomon6@gmail.com
Oluwadamilola Gold Ibidapo	goldoluwadamilola24@gmail.com
Oluseun Afolabi	kadolapo@gmail.com
Stephen  Oluwasegun Olasehinde	mkoluwaseun@gmail.com
Margaret Ogunbayo	margaretabidemi2017@gmail.com
Ebenezer Oluwasunkanmi Ilori	ebenezeriloriclc@gmail.com
Oluwadamilola Olawale	olaleyedamilola20@gmail.com
Ibukunoluwa Adeoye-Fowosire	ibukunoluwafowosire@gmail.com
Olakitan Olu-Omoniyi Jones	kiitanjones@gmail.com
Bamigboye Babasegunfunmi Babatunde	thebamigboye@gmail.com
Oluwatobi Mary Ilori	oluwatobiebenezerilori@gmail.com
Attah Abel Jatan	attahabel4@gmail.com
Unknown	noahige234@gmail.com
Sogo Ayenigba sogostorage@gmail.com`;

const lines = RAW_DATA.trim().split('\n');
const ILORIN_PARTICIPANTS = lines.map(line => {
  // Try to split by tab first, otherwise fall back to matching the last space before the @ symbol
  let parts = line.split('\t');
  if (parts.length < 2) {
      // Split by space, the last part should be email if it contains @
      const words = line.trim().split(/\s+/);
      const email = words.pop();
      const name = words.join(' ');
      return { fullName: name, email: email };
  }
  return { fullName: parts[0].trim(), email: parts[1].trim() };
}).filter(p => p.email && p.email.includes('@'));

function emailToDocId(email) {
  return `ILORIN_${email.toLowerCase().trim().replace(/[@.+]/g, '_')}`;
}

async function registerParticipant(participant) {
  const email = participant.email.toLowerCase().trim();
  const docId = emailToDocId(email);

  try {
    await setDoc(doc(db, "students", docId), {
      fullName: participant.fullName,
      email: email,
      cohort: "Ilorin",
      paymentReference: "ADMIN_REGISTERED",
      status: "paid",
      cbtActivated: false,
      registeredAt: serverTimestamp(),
    });
    console.log(`✅ Registered: ${participant.fullName} (${email})`);
  } catch (err) {
    console.error(`❌ Failed for ${participant.fullName} (${email}):`, err.message);
  }
}

async function run() {
  console.log(`🚀 Registering ${ILORIN_PARTICIPANTS.length} Ilorin cohort participants...\n`);
  for (const participant of ILORIN_PARTICIPANTS) {
    await registerParticipant(participant);
  }
  console.log(`\n✨ Done! All participants are now pre-registered.`);
  console.log(`📧 When ready, send the activation link: https://fma-registration.vercel.app/cbt/activate`);
  process.exit(0);
}

run();
