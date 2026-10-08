// Run: node scripts/seedLocalSecretaries.mjs
// Make sure server is running on http://localhost:5000

const TENURE_YEAR_ID = "6a045e74dbc1d8de4ebeb7ce";
const BASE_URL = "http://localhost:5000/api/local-secretary";

// Auth token - paste your token here
//const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTA0NWMwYWRiYzFkOGRlNGViZWI2ZWQiLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3Nzg5MTA0NDAsImV4cCI6MTc4MTUwMjQ0MH0.WGxd6d0_jfLKBFp1x531ZzH6GgkdEEhzjcIb0fFUEMI";

const secretaries = [
  { name: "Mr. S. Hashim Raza Rizvi", address: "14/109, Aza Khana, Shahganj, Agra", city: "Agra", state: "U.P", mobileNumber: "9897316422" },
  { name: "Prof. Mohd. Mohsin", address: "Street No. 1, Near Markati Masjid, Dhorra Mafi, Aligarh", city: "Aligarh", state: "U.P", mobileNumber: "9870955551" },
  { name: "Maulana Syed Zahid Husain", address: "B 203 Husaini complex Zohrabagh Aligarh", city: "Aligarh", state: "U.P", mobileNumber: "9412673478" },
  { name: "Prof. Syed Ali Amir", address: "Suroor Apartments, Sir Syed Nagar, Aligarh", city: "Aligarh", state: "U.P", mobileNumber: "9368758755" },
  { name: "Mr. Syed Firdos Ali Zaidi", address: "Near Husaini Masjid, Zohra Bagh, Civil Line, Aligarh", city: "Aligarh", state: "U.P", mobileNumber: "9319799772" },
  { name: "Mr. Syed Mustafa Ali Bilgrami", address: "Fatima Manzil,Lal Diggi Road", city: "Aligarh", state: "U.P", mobileNumber: "9368558795" },
  { name: "Mr. Syed Mazhar Haider Zaidi", address: "4/334, Amir Nishan, Aligarh-202002", city: "Aligarh", state: "U.P", mobileNumber: "9415275801" },
  { name: "Mr. Syed Mohd Ashfaq Husain", address: "Behind Gali No-06 Near Alika Community Centre Mohd Nagar Mallah ka Nagla -202002", city: "Aligarh", state: "U.P", mobileNumber: "9897809993" },
  { name: "Maulana Dr. Abbas Raza", address: "M.U. College, Dhorra Mafi Aligarh-202002", city: "Aligarh", state: "U.P", mobileNumber: "9412272058" },
  { name: "Mrs. Mumtaz Bilgrami", address: "Fatima Manzil , Anwarul Huda Compound , Lal Dippi, Aligarh-202001", city: "Aligarh", state: "U.P", mobileNumber: "9837111865" },
  { name: "Mr. Syed Mohammad Zahid Hasan (Gullu)", address: "Kothi Rani Dulhan, Mahmood Manzil , Doddhpur , Aligarh", city: "Aligarh", state: "U.P", mobileNumber: "9412345440" },
  { name: "Prof. Abid Ali Khan", address: "4/334, Amir Nishan, Aligarh-202002", city: "Aligarh", state: "U.P", mobileNumber: "7398211864" },
  { name: "Mr. Syed Mohammad Iqbal Hasan", address: "D895, GTB Nagar, Kareli Colony Allahabad -211016 U.P", city: "Allahabad", state: "U.P", mobileNumber: "7985852324" },
  { name: "Maulana Dilshad Abbas", address: "Dandupur Distt-Allahabad Dandupur - 2008 U.P.", city: "Allahabad", state: "U.P", mobileNumber: "9935049419" },
  { name: "Mr. Zaheer Haider", address: "428/7 Block-A GTB Nagar, Kareli Allahabad-211001", city: "Allahabad", state: "U.P", mobileNumber: "8400842404" },
  { name: "Maulana Syed Mohd Abbas", address: "Meeran Pur , Faizabad Road, Akbarpur , Ambedkar Nagar -224122, U.P", city: "Ambedkar Nagar", state: "U.P", mobileNumber: "8400842404" },
  { name: "Mr. Mohd Faheem", address: "Mohalla Usmanpur Jalalpur Amedkarnagar U.P-224181", city: "Amedkarnagar", state: "U.P", mobileNumber: "9028236862" },
  { name: "Mr. Syed Farhan Ali Zaidi", address: "Behind Sidhi Vinayak Apptt. Sanklap Colony Yankayapura Camp, Amravati Maharashtra -444602", city: "Amroha", state: "U.P", mobileNumber: "8279892851" },
  { name: "Er. Suhail Murtaza", address: "110-A, Guzri Street Amroha-244221 U.P", city: "Amroha", state: "U.P", mobileNumber: "9412596645" },
  { name: "Mr. Syed Mohd. Askari Zaidi", address: "Mohalla Darbar Meerakhan, Amroha", city: "Amroha", state: "U.P", mobileNumber: "7378671110" },
  { name: "Dr. Syed Mohd Jafar Baqri", address: "Vill. & Post-Said Nagli, Tehsil-Hasanpur, Amroha", city: "Augangabad", state: "U.P", mobileNumber: "9838075490" },
  { name: "Mrs Sara Raza Abedi", address: "House No-2-3-100 A, Mahada colony Champa Chowk Aurangabad-MS-431001", city: "Azamgarh", state: "U.P", mobileNumber: "7483308202" },
  { name: "Mohammad Ali (Shamsi)", address: "Hamzapur rani ki Sarai Azamgarh-276001", city: "Bangalore", state: "Karnataka", mobileNumber: "9906483333" },
  { name: "Mr. Sajid Abbas", address: "No-208, 3rd Floor, Stanely Street,Opp Small Church, Near Malik Bazar, Austin Town, Bangalore 560047", city: "Bareilly", state: "U.P", mobileNumber: "9690617592" },
  { name: "Mr. Mohmmad Yousuf Dar", address: "No-208, 3rd Floor, Stanely Street,Opp Small Church, Near Malik Bazar, Austin Town, Bangalore 560047", city: "Bareilly", state: "U.P", mobileNumber: "8005023186" },
  { name: "Mr. Imran Raza Abidi", address: "Abidi Coaching Centre, E-244, Ekta Nagar, Bareilly -U.P", city: "Basti", state: "U.P", mobileNumber: "9906830808" },
  { name: "Syed Sabir Mobeen Rizvi", address: "KP Bala Singhoora Pathan,Distict Baramulla Kashmir-193121", city: "Beerwa", state: "J&K", mobileNumber: "9906830808" },
  { name: "Er. Malik Hilal", address: "Turkohlyo Gandhi Nagar Basti Amhul Basti -272001", city: "Behraich", state: "U.P", mobileNumber: "9839767030" },
  { name: "Mr. Syed Sagheer Abid Rizvi (Advocate)", address: "R/O Sonapah, Beerwa, Budgam, Kashmir, P.O. Beerwa-193411", city: "Bhagalpur", state: "Bihar", mobileNumber: "9430863153" },
  { name: "Mr. Syed Raza Rizvi", address: "Moh. Qazi Wara , Behraich", city: "Bhagalpur", state: "U.P", mobileNumber: "9826059416" },
  { name: "Mr. Mohd. Anwar Ali", address: "Habeebpur Near Habeeb Shah Mazar", city: "Bhopal", state: "M.P", mobileNumber: "8349700786" },
  { name: "Mr. Sibtain Rizvi", address: "16/01, Nagar Nijam Colony, Berasiya Road, Bhopal-462001", city: "Budaun", state: "U.P", mobileNumber: "8534856248" },
  { name: "Mr. Syed Mohammad Ahmad Rizvi (Gulrez)", address: "A-61 Housing Board Colony Near Fitness Center Koh-e-Fiza Huzur Bhopal-462001", city: "Bulandshahr", state: "U.P", mobileNumber: "9359998637" },
  { name: "Mr. Shakeel Abbas", address: "Ward No-24 Habeli Sadat Bisauli Budaun-202520", city: "Chandigarh", state: "Punjab", mobileNumber: "9983371214" },
  { name: "Dr. S. Raza Yusuf Naqvi", address: "Qutub Darwaza, Shikarpur", city: "Chhapra", state: "Bihar", mobileNumber: "9955633875" },
  { name: "Dr. Ali Abbas", address: "H-No-E-03 P U Campus Sector-14 Chandigarh -160014", city: "Delhi", state: "Delhi", mobileNumber: "7217614180" },
  { name: "Mr. S. Kazim Raza Rizvi", address: "Shia Colony, Mohalla Dahliyawan, Chapra, Bihar", city: "Delhi", state: "Delhi", mobileNumber: "9990200190" },
  { name: "Mr. Syed Hasan Mujtaba (C.I. Retd)", address: "J-302, Taj Enclave, Geeta Colony, Delhi-31", city: "Delhi", state: "Delhi", mobileNumber: "9897390740" },
  { name: "Mr. Ghadeer Raza Abidi", address: "9/3-4 Near Chand Masjid, Khicharipur Patpurganj, East Delhi-110091", city: "Etawah", state: "U.P", mobileNumber: "9359565151" },
  { name: "Mr. Syed Irshad Haider Jafri", address: "D-6/14 Sector-15 Rohini Delhi-110085", city: "Faizabad", state: "U.P", mobileNumber: "9336666878" },
  { name: "Mr. Mohd. Asif Rizvi", address: "S-76, Saliti Ganj, Etawah", city: "Faizabad", state: "U.P", mobileNumber: "9935172707" },
  { name: "Mr. S. Hasan Haider Rizvi", address: "Sub Registrar Retired, Maulana Wasi Mohd. Road, Rath Haweli", city: "Fatehpur", state: "U.P", mobileNumber: "9140035656" },
  { name: "Mr.Syed Sheeraz Husain", address: "House No. 4/4/2/3, Rath Haweli, Faizabad", city: "Fatehpur", state: "U.P", mobileNumber: "7355750113" },
  { name: "Mr. Syed Asghar Meher Naqvi", address: "Village & P.O Baragaon, Distt Faizabad", city: "Ghaziabad", state: "U.P", mobileNumber: "9868425442" },
  { name: "Mr. Syed Qamar Abbas Rizvi", address: "228, BaqarGanj, Bardani Bazar, Fatehpur (Haswa) Fatehpur-212645", city: "Ghazipur", state: "U.P", mobileNumber: "7522817182" },
  { name: "Mr. Syed Abbas Raza Rizvi", address: "Nirtra, Sector-23, Raj Nagar, Ghaziabad", city: "Gorakhpur", state: "U.P", mobileNumber: "9935451203" },
  { name: "Mr. S. Javed Husain", address: "House No. 56/A, Mohalla- Nigahi Beg , Near Town Hall", city: "Gujrat", state: "Gujrat", mobileNumber: "9099666870" },
  { name: "Mr. Mirza Ali Abbas", address: "S/o Late Mirza Ishrat Husain, Khadim Kada, Shekhpur, Gorakhpur", city: "Gurugram", state: "Haryana", mobileNumber: "7680903380" },
  { name: "Mr. Jafar Abbas", address: "Hasanali Malpura Golden Park Society Near Jafery English School Kanodar Banaskantha Guajrat-385520", city: "Haridwar", state: "U.K", mobileNumber: "8437437231" },
  { name: "Mr. Syed Hussain Hamid Rizvi", address: "Tower H, Flat -302 SS Coralwood Sector-84, Gurgaon Haryana -122004", city: "Hyderabad", state: "A.P", mobileNumber: "7569993028" },
  { name: "Maulana Syed Miraj Mehdi Zaidi", address: "Mohalla Meetha Nora Town Manglour Distt. Haridwar Uttarakhand", city: "Hyderabad", state: "A.P", mobileNumber: "6302383399" },
  { name: "Mr. Syed Ali Faiz Husaini", address: "H-N-B-1-423/A/64 Diamond Residency Dilamaon Hills Colony Shakpet Manikonda VTC Golconda Distt- Hyderabad -500008", city: "Hyderabad", state: "A.P", mobileNumber: "8686257737" },
  { name: "Mr. Mohammad Abbas", address: "Husaini Mohalla Noor Bazar Hyderabad -500024", city: "Jaipur", state: "Rajesthan", mobileNumber: "9351434826" },
  { name: "Mrs. Rehna Shaheen", address: "C/o Syed Fazal Masood Abidi, House No.17-5-258, Outside, Dabeerpura, Mata ki Khirki,", city: "Jaunpur", state: "U.P", mobileNumber: "9415287862" },
  { name: "Mr. Syed Tahir Husain Zaidi", address: "1006, Chahar Darwaza, Gak Public School, Jaipur (Raj)", city: "Jaunpur", state: "U.P", mobileNumber: "8090549293" },
  { name: "Dr. Syed. Qamar Abbas", address: "Shifa Mahol, Mohalla Sipah Jaunpur", city: "Jaunpur", state: "U.P", mobileNumber: "9335072347" },
  { name: "Dr. Abrar Husain", address: "Mohalla New Abadi, Shah Ganj Jaunpur", city: "Jaunpur", state: "U.P", mobileNumber: "9026404346" },
  { name: "Mr. Syed Zakir Naseem Wasti", address: "N.W Cottage Sipah Sadar Jaunpur", city: "Jhansi", state: "U.P", mobileNumber: "9793816007" },
  { name: "Mr. Ehtisham Haider", address: "S/o Mr. Israr Husain. 154 A. Abeer Garh Tola , P.O. Sadar Distt. Jaunpur 22001", city: "Jhansi", state: "U.P", mobileNumber: "9839029697" },
  { name: "Maulana syed Farman Ali Abdi", address: "c/oRazi Ali 133,Mewati puraShiya Masjid Jhansi khas,Jhansi", city: "Kanpur", state: "U.P", mobileNumber: "7318440012" },
  { name: "Mr. Syed Ali Zafar Abidi (Retd. C.O.S)", address: "14/55-C; Civil Lines, Behind Sangeeta Apartment; Kanpur-208001", city: "Kanpur", state: "U.P", mobileNumber: "8799271243" },
  { name: "Maulana Sayeed Abbas Khan (Imam e Juma)", address: "11/169 Maqbara Gwaltoli Kanpur-208001", city: "Kaushambi", state: "U.P", mobileNumber: "9616877642" },
  { name: "Mr. Syed. Nazir Haider", address: "Town & P.O. Karari, Chamanganj Kaushambi", city: "Kaushambi", state: "U.P", mobileNumber: "9794861298" },
  { name: "Mr. Mohd. Ageel", address: "Moh. Naya Ganj , Town & Post , Karari kaushambi -212206", city: "Kolkata", state: "W.B", mobileNumber: "9794861298" },
  { name: "Mr. Syed Ainul Raza Kararvi", address: "Bayte Zahra, Sharifabad, Hazratganj, Karari, Kaushambi-212206", city: "Kolkata", state: "W.B", mobileNumber: "7278914201" },
  { name: "Mr. Syed Mohammed Taquee", address: "I-40 Garden reach Kolkata-700024", city: "Kolkata", state: "W.B", mobileNumber: "9836183899" },
  { name: "Mr. Syed Kazim Raza Naqvi", address: "Aliyan House 1/1 rifle range road Kolkata-700017", city: "Kolkata", state: "W.B", mobileNumber: "9433050643" },
  { name: "Mr. Syed Ali Mehdi Rizvi", address: "C/o Usmania Book Depot , 27-volootala Street , Kolkata -700073", city: "Lucknow", state: "U.P", mobileNumber: "9451904612" },
  { name: "Mr. Syed Ehsan Imam Abidi", address: "C/333, Rajajipuram, Lucknow- 17", city: "Lucknow", state: "U.P", mobileNumber: "9918303001" },
  { name: "Mr. Syed Karrar Asghar Zaidi", address: "Flat No-5B Tower-14 Metro city Paper Mill Colony Nishadganj Lucknow-226006", city: "Lucknow", state: "U.P", mobileNumber: "9839024033" },
  { name: "Mr. Zamanat Ali", address: "2, Banjari Tola ,Azmat Manzil, Victoria Street, Lucknow-3", city: "Lucknow", state: "U.P", mobileNumber: "9412983417" },
  { name: "Mr. Syed Nasir Abbas Zaidi", address: "546/685 Sarfarazganj Hardoi road ImamBara Bilqees Jahan ke Pass Chwok Lucknow-03", city: "Lucknow", state: "U.P", mobileNumber: "7505595595" },
  { name: "Mr. Samad Abbas", address: "353/57 Chavni Hasanuddin Khan Khariyahi Lucknow-226003", city: "Lucknow", state: "U.P", mobileNumber: "6392771331" },
  { name: "Dr. Syeda Naseem Subuhi Sahiba", address: "Exon Model School Mansoor Nagar , Lucknow- 226003", city: "Lucknow", state: "U.P", mobileNumber: "8790473548" },
  { name: "Mrs. Arjumand Zaidi", address: "(Director) St. Xavier Convent School, Vineet Khand-2, Gomti Nagar, Lucknow", city: "Lucknow", state: "U.P", mobileNumber: "9839024033" },
  { name: "Mr. Syed Sajjad Haider Husaini", address: "02 Banjari tola Azmat Manzil Victoria Street Lucknow-226003", city: "Lucknow", state: "U.P", mobileNumber: "9005091103" },
  { name: "Mr. Syed Husain Imam", address: "S.1/59 Vishwas Surakasha. Eldeco Udhyan II. Raibarely Rd Lucknow- 226025", city: "Lucknow", state: "U.P", mobileNumber: "9455769800" },
  { name: "Mr. Syed Qasim Raza Ana", address: "Rizvi Kashan Aman enclave behind Baby Martin School Dubagga Hardoi road Lucknow", city: "Lucknow", state: "U.P", mobileNumber: "9506030110" },
  { name: "Mr. Syed Mohd. Abbas", address: "Gulshan e Hasan,449/78/1A,GLM Road,Near Maliki Masjid,Mufti Ganj, Lucknow", city: "Lucknow", state: "U.P", mobileNumber: "9936825150" },
  { name: "Mr. Syed Afaq Imam (Retd. Dy.Manager)", address: "514 Uphar Sector 01 ELDECO-Ind Rai Bareilly road Lucknow-226025", city: "Mau", state: "U.P", mobileNumber: "9936823396" },
  { name: "Mr. Syed Azeem Abbas", address: "Syedwara Mohammadabad Ghona Mau-276403", city: "Meerut", state: "U.P", mobileNumber: "8791004450" },
  { name: "Mrs. Mahjabeen Hasan Zaidi", address: "113, Sector - 10, Shastri Nagar, Meerut - 250004", city: "Meerut", state: "U.P", mobileNumber: "8750291219" },
  { name: "Mr. Syed Hadi Hasan Zaidi", address: "786/1Zaidi farm near Mohsin Masjid Mohsin Bagh Zaidi Farm Meerut-250002", city: "Mumbai", state: "M.S", mobileNumber: "9867349625" },
  { name: "Mr. Syed Raza Fatima Rizvi", address: "General Manager (Retd) Union Bank of India, 501, Himasai Building No. 16, Mhada, Oshiwara, Andheri (west) Mumbai-400053", city: "Mumbai", state: "M.S", mobileNumber: "9869066973" },
  { name: "Mr. Mohd Mohsin Sb", address: "Natraj B Wing,402 Near God gift Tower Yari Road ,Versova, Andheri (W) Mumbai-400095", city: "Mumbai", state: "MS", mobileNumber: "9884446658" },
  { name: "Mr. Safdar Abbas Rizvi", address: "Room No-601 Khajuri Chawl Malwani Gate No-05 Malad (West) Mumbai-4500095", city: "Mumbai", state: "MS", mobileNumber: "9867343062" },
  { name: "Dr. Nazar Abbas Jafry", address: "Zainabla Trust , 132, Husaina Marg Bohri Mohalla , Bhindi Bazar", city: "Muzaffarpur", state: "Bihar", mobileNumber: "9709574114" },
  { name: "Mr. Ibne Hasan Bilgrami", address: "B/G-01 Highland Court CHSL (Co- operating) H.S. Limited Bazar Road Bandra West", city: "Muzaffarnagar", state: "Bihar", mobileNumber: "8278915115" },
  { name: "Mr. Syed Sarwar Ali", address: "Kamra, Chandwarah, Near Bara Imambara, Muzaffarpur Bihar", city: "Nagpur", state: "MS", mobileNumber: "9756041584" },
  { name: "Maulana Adil Raza Zaidi Sb.", address: "Near Imambara, Paighambarpur, Kolhua, Muzaffarnagar Bihar", city: "Naugwan Sadat", state: "U.P", mobileNumber: "9975053311101" },
  { name: "Maulana Ghulam Hasnain Baqri", address: "97/131 South Krishnapuri Muzaffarnagar-251002", city: "New Delhi", state: "U.P", mobileNumber: "9873008329" },
  { name: "Ar. Syed Zaki Abidi", address: "House No.9, Takia Deewan, Mominpura, Nagpur MS", city: "New Delhi", state: "New Delhi", mobileNumber: "9811605871" },
  { name: "Mrs. Razia Abbas", address: "H.No. 37 EngineerStreetMohalla -Baramulla Tehsil Naugawan Sadat Dist.Amroha", city: "New Delhi", state: "New Delhi", mobileNumber: "9899106005" },
  { name: "Mr. Syed Ali Zaheen Naqvi", address: "157/1A Ghaffar Manzil Colony Jamia Nagar New Delhi-110025", city: "New Delhi", state: "New Delhi", mobileNumber: "9818244361" },
  { name: "Mr. Syed Raza Abidi", address: "669/12, II nd Floor, Zakir Nagar, Okhla , New Delhi -25", city: "New Delhi", state: "New Delhi", mobileNumber: "9313311918" },
  { name: "Haji Dr. Syed Mohd Abbas Zaidi", address: "House No- 0-54/2, Batla House , Okhla , New Delhi -25", city: "Noida", state: "U.P", mobileNumber: "9810085695" },
  { name: "Mr. Shamshul Hasan", address: "11-Noor Nagar Ext.Jamia Nagar New Delhi-25", city: "Noida", state: "U.P", mobileNumber: "9911060122" },
  { name: "Mr. Syed Raza Haider Abidi", address: "C-20, Gali No.8, Batla House, Jamia Nagar", city: "Parbhani", state: "M.S", mobileNumber: "9421291366" },
  { name: "Mr. Syed Tayyab Raza Abidi", address: "House No. 503, Tower-05, Parsvnath Prisrishi-II, Sector-93-A, Noida-201304", city: "Patna", state: "Bihar", mobileNumber: "9431024415" },
  { name: "Mr. Mirza Sajjad Ali Baig", address: "S/o Mr. Hyder Ali Baig, Panje Shah Moh. Near Ashoorkhana , Panje Shah, Parbhani-431401", city: "Patna", state: "Bihar", mobileNumber: "7258974632" },
  { name: "Mr. Syed Mudassir Imam Rizvi", address: "Rizvi Cottage, Pathan Toli, Alamganj, Patna -07", city: "Patna", state: "Bihar", mobileNumber: "8884570045" },
  { name: "Mr. Syed Ejaz Husain", address: "Pathan Toli Alam Ganj Patna", city: "Patna", state: "Bihar", mobileNumber: "9431024415" },
  { name: "Mr. Syed Akhlaq Haider", address: "Hasanpura House Saqqa Lui Alamganj, Opposite Lagana, Patna", city: "Pune", state: "M.S", mobileNumber: "8090200974" },
  { name: "Mr. Syed Kashif Hasan Rizvi", address: "Arshia Manzil, Bari Masjid, Gali Alam Ganj, Opposite Lagana, Patna", city: "Rai Bareli", state: "U.P", mobileNumber: "9415262926" },
  { name: "Mr. Saif Mehdi", address: "Flat No-701 Building D Society Suyog Paradise Nibm Pune-411048", city: "Ranchi", state: "Jharkhand", mobileNumber: "9889763300" },
  { name: "Mr. Shahab Naqvi", address: "34 Tar Tala Rai Bareli", city: "Rohtas", state: "Bihar", mobileNumber: "9415345001" },
  { name: "Mr. Mohd. Shafi", address: "Moh. Kanchana, Post-Jais", city: "Shamli", state: "U.P", mobileNumber: "9927069986" },
  { name: "Mr. Syed. Iqbal Husain", address: "Iqbal Manzil, IIIrd Street, Hind Piri", city: "Sidharthnagar", state: "U.P", mobileNumber: "9452210934" },
  { name: "Mr. Zille Hasan(Retd. Admin. Officer)", address: "V. & P.O. Aurangabad Saraiya Via Tiloothu, Distt. Rohtas-BIHAR", city: "Sitapur", state: "U.P", mobileNumber: "9795892911" },
  { name: "Mr. Syed Yaqub Akhtar", address: "47 Ghazipur Ghazipura Shamli Gogwan UP-247773", city: "Sitapur", state: "U.P", mobileNumber: "9415771508" },
  { name: "Mr. S. Intezar Husain Rizvi", address: "Modern Secondary School, Hallaur", city: "Srinagar", state: "J&K", mobileNumber: "9389173972" },
  { name: "Mr. Syed Hasan Kazim Jafri", address: "Sheikh Sarai, Old Town Sitapur - 261001", city: "Thane", state: "M.S", mobileNumber: "9821193390" },
  { name: "Mr. Syed Ali Mohd. Jafri", address: "37, Mohalia Sheikh Sarai, Old Town, Sitapur", city: "Unnao", state: "U.P", mobileNumber: "7408601807" },
  { name: "Mr. Syed Abbas Husain Khan", address: "C/O Baiti House, Sector 7, Hamdania Colony, Bemina, Srinagar", city: "Vadodra", state: "Gujrat", mobileNumber: "9974328892" },
  { name: "Er. Arshad Husain Khan", address: "104,A Wing Asmita Ankur Naya Nagar Meera Road Dist.Thane", city: "Varanasi", state: "U.P", mobileNumber: "9450543234" },
  { name: "Dr. Syed Abbas Alam", address: "78-B, Qasim Nagar, Near Shitla Devi Mandir Unnao", city: "Varanasi", state: "U.P", mobileNumber: "7985480554" },
  { name: "Mr. Syed Zulqarnain Haider", address: "8/124, Rehmat Park , Karodiya Road Gorwa Vadodra", city: "Varanasi", state: "U.P", mobileNumber: "7985480554" },
  { name: "Mrs. Syed Shaheen Zehra", address: "(Retd AGM, UBI), H.No. B-3/330, Shivala, Varanasi", city: "Varanasi", state: "U.P", mobileNumber: "7985480554" },
  { name: "Mr. Syed Alim Husain Rizvi", address: "C K 42/21, Chalmama Dalmandi Road Varanasi-221001", city: "Varanasi", state: "U.P", mobileNumber: "7985480554" },
  { name: "Mr. Mohammad Saghar Mehdi", address: "Exon Model School Mansoor Nagar , Lucknow- 226003", city: "Lucknow", state: "U.P", mobileNumber: "7985480554" },
];

// ─── Send requests one by one ────────────────────────────────────────────────
let success = 0;
let failed = 0;

for (const sec of secretaries) {
  const body = {
    name: sec.name,
    address: sec.address,
    city: sec.city,
    state: sec.state,
    mobileNumber: sec.mobileNumber,
    tenureYear: TENURE_YEAR_ID,
    status: "Active",
  };

  try {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${AUTH_TOKEN}`,
      },
      body: JSON.stringify(body),
    });

    const json = await res.json();

    if (res.ok) {
      success++;
      console.log(`✅ [${success}] ${sec.name} — ${sec.city}`);
    } else {
      failed++;
      console.warn(`⚠️  SKIP [${sec.name}]: ${json.message}`);
    }
  } catch (err) {
    failed++;
    console.error(`❌ ERROR [${sec.name}]:`, err.message);
  }
}

