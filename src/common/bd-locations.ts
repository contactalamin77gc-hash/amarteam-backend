export interface District {
  id: number;
  name: string;
  nameBn: string;
  division: string;
  upazilas: string[];
}

export const BD_DIVISIONS = [
  'Dhaka', 'Chattogram', 'Rajshahi', 'Khulna',
  'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh',
];

export const BD_DISTRICTS: District[] = [
  // ─── DHAKA DIVISION ───
  { id: 1, name: 'Dhaka', nameBn: 'ঢাকা', division: 'Dhaka', upazilas: ['Dhamrai', 'Dohar', 'Keraniganj', 'Nawabganj', 'Savar', 'Tejgaon', 'Mirpur', 'Mohammadpur', 'Gulshan', 'Uttara', 'Motijheel', 'Ramna', 'Dhanmondi', 'Badda', 'Khilgaon'] },
  { id: 2, name: 'Gazipur', nameBn: 'গাজীপুর', division: 'Dhaka', upazilas: ['Gazipur Sadar', 'Kaliakair', 'Kapasia', 'Sreepur', 'Kaliganj', 'Tongi'] },
  { id: 3, name: 'Narayanganj', nameBn: 'নারায়ণগঞ্জ', division: 'Dhaka', upazilas: ['Araihazar', 'Bandar', 'Narayanganj Sadar', 'Rupganj', 'Sonargaon'] },
  { id: 4, name: 'Tangail', nameBn: 'টাঙ্গাইল', division: 'Dhaka', upazilas: ['Basail', 'Bhuapur', 'Delduar', 'Dhanbari', 'Ghatail', 'Gopalpur', 'Kalihati', 'Madhupur', 'Mirzapur', 'Nagarpur', 'Sakhipur', 'Tangail Sadar'] },
  { id: 5, name: 'Narsingdi', nameBn: 'নরসিংদী', division: 'Dhaka', upazilas: ['Belabo', 'Monohardi', 'Narsingdi Sadar', 'Palash', 'Raipura', 'Shibpur'] },
  { id: 6, name: 'Munshiganj', nameBn: 'মুন্সিগঞ্জ', division: 'Dhaka', upazilas: ['Gazaria', 'Lohajang', 'Munshiganj Sadar', 'Sirajdikhan', 'Sreenagar', 'Tongibari'] },
  { id: 7, name: 'Manikganj', nameBn: 'মানিকগঞ্জ', division: 'Dhaka', upazilas: ['Daulatpur', 'Ghior', 'Harirampur', 'Manikganj Sadar', 'Saturia', 'Shivalaya', 'Singair'] },
  { id: 8, name: 'Faridpur', nameBn: 'ফরিদপুর', division: 'Dhaka', upazilas: ['Alfadanga', 'Bhanga', 'Boalmari', 'Charbhadrasan', 'Faridpur Sadar', 'Madhukhali', 'Nagarkanda', 'Sadarpur', 'Saltha'] },
  { id: 9, name: 'Gopalganj', nameBn: 'গোপালগঞ্জ', division: 'Dhaka', upazilas: ['Gopalganj Sadar', 'Kashiani', 'Kotalipara', 'Muksudpur', 'Tungipara'] },
  { id: 10, name: 'Madaripur', nameBn: 'মাদারীপুর', division: 'Dhaka', upazilas: ['Kalkini', 'Madaripur Sadar', 'Rajoir', 'Shibchar'] },
  { id: 11, name: 'Rajbari', nameBn: 'রাজবাড়ী', division: 'Dhaka', upazilas: ['Baliakandi', 'Goalandaghat', 'Pangsha', 'Kalukhali', 'Rajbari Sadar'] },
  { id: 12, name: 'Shariatpur', nameBn: 'শরীয়তপুর', division: 'Dhaka', upazilas: ['Bhedarganj', 'Damudya', 'Gosairhat', 'Naria', 'Shariatpur Sadar', 'Zajira'] },
  { id: 13, name: 'Kishoreganj', nameBn: 'কিশোরগঞ্জ', division: 'Dhaka', upazilas: ['Austagram', 'Bajitpur', 'Bhairab', 'Hossainpur', 'Itna', 'Karimganj', 'Katiadi', 'Kishoreganj Sadar', 'Kuliarchar', 'Mithamain', 'Nikli', 'Pakundia', 'Tarail'] },

  // ─── CHATTOGRAM DIVISION ───
  { id: 14, name: 'Chattogram', nameBn: 'চট্টগ্রাম', division: 'Chattogram', upazilas: ['Anwara', 'Banshkhali', 'Boalkhali', 'Chandanaish', 'Fatikchhari', 'Hathazari', 'Lohagara', 'Mirsharai', 'Patiya', 'Rangunia', 'Raozan', 'Sandwip', 'Satkania', 'Sitakunda', 'Karnaphuli'] },
  { id: 15, name: "Cox's Bazar", nameBn: 'কক্সবাজার', division: 'Chattogram', upazilas: ['Chakaria', "Cox's Bazar Sadar", 'Kutubdia', 'Maheshkhali', 'Ramu', 'Teknaf', 'Ukhia', 'Pekua'] },
  { id: 16, name: 'Cumilla', nameBn: 'কুমিল্লা', division: 'Chattogram', upazilas: ['Barura', 'Brahmanpara', 'Burichong', 'Chandina', 'Chauddagram', 'Daudkandi', 'Debidwar', 'Homna', 'Cumilla Sadar', 'Laksam', 'Monohorgonj', 'Meghna', 'Muradnagar', 'Nangalkot', 'Titas'] },
  { id: 17, name: 'Feni', nameBn: 'ফেনী', division: 'Chattogram', upazilas: ['Chhagalnaiya', 'Daganbhuiyan', 'Feni Sadar', 'Parshuram', 'Sonagazi', 'Fulgazi'] },
  { id: 18, name: 'Brahmanbaria', nameBn: 'ব্রাহ্মণবাড়িয়া', division: 'Chattogram', upazilas: ['Akhaura', 'Bancharampur', 'Brahmanbaria Sadar', 'Kasba', 'Nabinagar', 'Nasirnagar', 'Sarail', 'Ashuganj', 'Bijoynagar'] },
  { id: 19, name: 'Rangamati', nameBn: 'রাঙ্গামাটি', division: 'Chattogram', upazilas: ['Bagaichhari', 'Barkal', 'Kawkhali', 'Belaichhari', 'Kaptai', 'Juraichhari', 'Langadu', 'Naniarchar', 'Rajasthali', 'Rangamati Sadar'] },
  { id: 20, name: 'Noakhali', nameBn: 'নোয়াখালী', division: 'Chattogram', upazilas: ['Begumganj', 'Chatkhil', 'Companiganj', 'Hatiya', 'Senbagh', 'Sonaimuri', 'Subarnachar', 'Kabirhat', 'Noakhali Sadar'] },
  { id: 21, name: 'Chandpur', nameBn: 'চাঁদপুর', division: 'Chattogram', upazilas: ['Chandpur Sadar', 'Faridganj', 'Haimchar', 'Haziganj', 'Kachua', 'Matlab Uttar', 'Matlab Dakshin', 'Shahrasti'] },
  { id: 22, name: 'Lakshmipur', nameBn: 'লক্ষ্মীপুর', division: 'Chattogram', upazilas: ['Lakshmipur Sadar', 'Raipur', 'Ramganj', 'Ramgati', 'Kamalnagar'] },
  { id: 23, name: 'Khagrachhari', nameBn: 'খাগড়াছড়ি', division: 'Chattogram', upazilas: ['Dighinala', 'Khagrachhari Sadar', 'Lakshmichhari', 'Mahalchhari', 'Manikchhari', 'Matiranga', 'Panchhari', 'Ramgarh'] },
  { id: 24, name: 'Bandarban', nameBn: 'বান্দরবান', division: 'Chattogram', upazilas: ['Bandarban Sadar', 'Alikadam', 'Naikhongchhari', 'Rowangchhari', 'Lama', 'Ruma', 'Thanchi'] },

  // ─── RAJSHAHI DIVISION ───
  { id: 25, name: 'Rajshahi', nameBn: 'রাজশাহী', division: 'Rajshahi', upazilas: ['Bagha', 'Bagmara', 'Charghat', 'Durgapur', 'Godagari', 'Mohanpur', 'Paba', 'Puthia', 'Tanore'] },
  { id: 26, name: 'Bogura', nameBn: 'বগুড়া', division: 'Rajshahi', upazilas: ['Adamdighi', 'Bogura Sadar', 'Dhunat', 'Dhupchanchia', 'Gabtali', 'Kahaloo', 'Nandigram', 'Sariakandi', 'Shajahanpur', 'Sherpur', 'Shibganj', 'Sonatola'] },
  { id: 27, name: 'Pabna', nameBn: 'পাবনা', division: 'Rajshahi', upazilas: ['Atgharia', 'Bera', 'Bhangura', 'Chatmohar', 'Faridpur', 'Ishwardi', 'Pabna Sadar', 'Santhia', 'Sujanagar'] },
  { id: 28, name: 'Sirajganj', nameBn: 'সিরাজগঞ্জ', division: 'Rajshahi', upazilas: ['Belkuchi', 'Chauhali', 'Kamarkhanda', 'Kazipur', 'Raiganj', 'Shahjadpur', 'Sirajganj Sadar', 'Tarash', 'Ullahpara'] },
  { id: 29, name: 'Natore', nameBn: 'নাটোর', division: 'Rajshahi', upazilas: ['Bagatipara', 'Baraigram', 'Gurudaspur', 'Lalpur', 'Natore Sadar', 'Singra', 'Naldanga'] },
  { id: 30, name: 'Joypurhat', nameBn: 'জয়পুরহাট', division: 'Rajshahi', upazilas: ['Akkelpur', 'Joypurhat Sadar', 'Kalai', 'Khetlal', 'Panchbibi'] },
  { id: 31, name: 'Chapainawabganj', nameBn: 'চাঁপাইনবাবগঞ্জ', division: 'Rajshahi', upazilas: ['Bholahat', 'Gomastapur', 'Nachole', 'Chapainawabganj Sadar', 'Shibganj'] },
  { id: 32, name: 'Naogaon', nameBn: 'নওগাঁ', division: 'Rajshahi', upazilas: ['Atrai', 'Badalgachhi', 'Manda', 'Dhamoirhat', 'Mohadevpur', 'Naogaon Sadar', 'Niamatpur', 'Patnitala', 'Porsha', 'Raninagar', 'Sapahar'] },

  // ─── KHULNA DIVISION ───
  { id: 33, name: 'Khulna', nameBn: 'খুলনা', division: 'Khulna', upazilas: ['Batiaghata', 'Dacope', 'Dumuria', 'Dighalia', 'Koyra', 'Paikgachha', 'Phultala', 'Rupsha', 'Terokhada'] },
  { id: 34, name: 'Jashore', nameBn: 'যশোর', division: 'Khulna', upazilas: ['Abhaynagar', 'Bagherpara', 'Chaugachha', 'Jhikargachha', 'Keshabpur', 'Jashore Sadar', 'Manirampur', 'Sharsha'] },
  { id: 35, name: 'Satkhira', nameBn: 'সাতক্ষীরা', division: 'Khulna', upazilas: ['Assasuni', 'Debhata', 'Kalaroa', 'Kaliganj', 'Satkhira Sadar', 'Shyamnagar', 'Tala'] },
  { id: 36, name: 'Kushtia', nameBn: 'কুষ্টিয়া', division: 'Khulna', upazilas: ['Bheramara', 'Daulatpur', 'Khoksa', 'Kumarkhali', 'Kushtia Sadar', 'Mirpur'] },
  { id: 37, name: 'Bagerhat', nameBn: 'বাগেরহাট', division: 'Khulna', upazilas: ['Bagerhat Sadar', 'Chitalmari', 'Fakirhat', 'Kachua', 'Mollahat', 'Mongla', 'Morrelganj', 'Rampal', 'Sarankhola'] },
  { id: 38, name: 'Jhenaidah', nameBn: 'ঝিনাইদহ', division: 'Khulna', upazilas: ['Harinakunda', 'Jhenaidah Sadar', 'Kaliganj', 'Kotchandpur', 'Maheshpur', 'Shailkupa'] },
  { id: 39, name: 'Chuadanga', nameBn: 'চুয়াডাঙ্গা', division: 'Khulna', upazilas: ['Alamdanga', 'Chuadanga Sadar', 'Damurhuda', 'Jibannagar'] },
  { id: 40, name: 'Magura', nameBn: 'মাগুরা', division: 'Khulna', upazilas: ['Magura Sadar', 'Mohammadpur', 'Shalikha', 'Sreepur'] },
  { id: 41, name: 'Narail', nameBn: 'নড়াইল', division: 'Khulna', upazilas: ['Kalia', 'Lohagara', 'Narail Sadar'] },
  { id: 42, name: 'Meherpur', nameBn: 'মেহেরপুর', division: 'Khulna', upazilas: ['Gangni', 'Meherpur Sadar', 'Mujibnagar'] },

  // ─── BARISHAL DIVISION ───
  { id: 43, name: 'Barishal', nameBn: 'বরিশাল', division: 'Barishal', upazilas: ['Agailjhara', 'Babuganj', 'Bakerganj', 'Banaripara', 'Gaurnadi', 'Hizla', 'Barishal Sadar', 'Mehendiganj', 'Muladi', 'Wazirpur'] },
  { id: 44, name: 'Patuakhali', nameBn: 'পটুয়াখালী', division: 'Barishal', upazilas: ['Bauphal', 'Dashmina', 'Galachipa', 'Kalapara', 'Mirzaganj', 'Patuakhali Sadar', 'Rangabali', 'Dumki'] },
  { id: 45, name: 'Bhola', nameBn: 'ভোলা', division: 'Barishal', upazilas: ['Bhola Sadar', 'Burhanuddin', 'Char Fasson', 'Daulatkhan', 'Lalmohan', 'Manpura', 'Tazumuddin'] },
  { id: 46, name: 'Pirojpur', nameBn: 'পিরোজপুর', division: 'Barishal', upazilas: ['Bhandaria', 'Kawkhali', 'Mathbaria', 'Nazirpur', 'Pirojpur Sadar', 'Nesarabad', 'Zianagar'] },
  { id: 47, name: 'Jhalokati', nameBn: 'ঝালকাঠি', division: 'Barishal', upazilas: ['Jhalokati Sadar', 'Kathalia', 'Nalchity', 'Rajapur'] },
  { id: 48, name: 'Barguna', nameBn: 'বরগুনা', division: 'Barishal', upazilas: ['Amtali', 'Bamna', 'Barguna Sadar', 'Betagi', 'Patharghata', 'Taltali'] },

  // ─── SYLHET DIVISION ───
  { id: 49, name: 'Sylhet', nameBn: 'সিলেট', division: 'Sylhet', upazilas: ['Balaganj', 'Beanibazar', 'Bishwanath', 'Companiganj', 'Fenchuganj', 'Golapganj', 'Gowainghat', 'Jaintiapur', 'Kanaighat', 'Sylhet Sadar', 'Zakiganj', 'Dakshin Surma', 'Osmani Nagar'] },
  { id: 50, name: 'Moulvibazar', nameBn: 'মৌলভীবাজার', division: 'Sylhet', upazilas: ['Barlekha', 'Kamalganj', 'Kulaura', 'Moulvibazar Sadar', 'Rajnagar', 'Sreemangal', 'Juri'] },
  { id: 51, name: 'Habiganj', nameBn: 'হবিগঞ্জ', division: 'Sylhet', upazilas: ['Ajmiriganj', 'Bahubal', 'Baniyachong', 'Chunarughat', 'Habiganj Sadar', 'Lakhai', 'Madhabpur', 'Nabiganj', 'Shayestaganj'] },
  { id: 52, name: 'Sunamganj', nameBn: 'সুনামগঞ্জ', division: 'Sylhet', upazilas: ['Bishwamvarpur', 'Chhatak', 'Derai', 'Dharampasha', 'Dowarabazar', 'Jagannathpur', 'Jamalganj', 'Sullah', 'Sunamganj Sadar', 'Tahirpur', 'South Sunamganj'] },

  // ─── RANGPUR DIVISION ───
  { id: 53, name: 'Rangpur', nameBn: 'রংপুর', division: 'Rangpur', upazilas: ['Badarganj', 'Gangachhara', 'Kaunia', 'Rangpur Sadar', 'Mithapukur', 'Pirgachha', 'Pirganj', 'Taraganj'] },
  { id: 54, name: 'Dinajpur', nameBn: 'দিনাজপুর', division: 'Rangpur', upazilas: ['Birampur', 'Birganj', 'Biral', 'Bochaganj', 'Chirirbandar', 'Phulbari', 'Ghoraghat', 'Hakimpur', 'Kaharole', 'Khansama', 'Dinajpur Sadar', 'Nawabganj', 'Parbatipur'] },
  { id: 55, name: 'Kurigram', nameBn: 'কুড়িগ্রাম', division: 'Rangpur', upazilas: ['Bhurungamari', 'Char Rajibpur', 'Chilmari', 'Phulbari', 'Kurigram Sadar', 'Nageshwari', 'Rajarhat', 'Raomari', 'Ulipur'] },
  { id: 56, name: 'Gaibandha', nameBn: 'গাইবান্ধা', division: 'Rangpur', upazilas: ['Phulchhari', 'Gaibandha Sadar', 'Gobindaganj', 'Palashbari', 'Sadullapur', 'Saghata', 'Sundarganj'] },
  { id: 57, name: 'Nilphamari', nameBn: 'নীলফামারী', division: 'Rangpur', upazilas: ['Dimla', 'Domar', 'Jaldhaka', 'Kishoreganj', 'Nilphamari Sadar', 'Saidpur'] },
  { id: 58, name: 'Thakurgaon', nameBn: 'ঠাকুরগাঁও', division: 'Rangpur', upazilas: ['Baliadangi', 'Haripur', 'Pirganj', 'Ranisankail', 'Thakurgaon Sadar'] },
  { id: 59, name: 'Panchagarh', nameBn: 'পঞ্চগড়', division: 'Rangpur', upazilas: ['Atwari', 'Boda', 'Debiganj', 'Panchagarh Sadar', 'Tetulia'] },
  { id: 60, name: 'Lalmonirhat', nameBn: 'লালমনিরহাট', division: 'Rangpur', upazilas: ['Aditmari', 'Hatibandha', 'Kaliganj', 'Lalmonirhat Sadar', 'Patgram'] },

  // ─── MYMENSINGH DIVISION ───
  { id: 61, name: 'Mymensingh', nameBn: 'ময়মনসিংহ', division: 'Mymensingh', upazilas: ['Bhaluka', 'Dhobaura', 'Fulbaria', 'Gaffargaon', 'Gauripur', 'Haluaghat', 'Ishwarganj', 'Mymensingh Sadar', 'Muktagachha', 'Nandail', 'Phulpur', 'Trishal', 'Tarakanda'] },
  { id: 62, name: 'Jamalpur', nameBn: 'জামালপুর', division: 'Mymensingh', upazilas: ['Baksiganj', 'Dewanganj', 'Islampur', 'Jamalpur Sadar', 'Madarganj', 'Melandaha', 'Sarishabari'] },
  { id: 63, name: 'Netrokona', nameBn: 'নেত্রকোণা', division: 'Mymensingh', upazilas: ['Atpara', 'Barhatta', 'Durgapur', 'Khaliajuri', 'Kalmakanda', 'Kendua', 'Madan', 'Mohanganj', 'Netrokona Sadar', 'Purbadhala'] },
  { id: 64, name: 'Sherpur', nameBn: 'শেরপুর', division: 'Mymensingh', upazilas: ['Jhenaigati', 'Nakla', 'Nalitabari', 'Sherpur Sadar', 'Sreebardi'] },
];

export const DISTRICT_NAMES = BD_DISTRICTS.map(d => d.name);

export function getUpazilas(districtName: string): string[] {
  return BD_DISTRICTS.find(d => d.name === districtName)?.upazilas || [];
}

export function isValidDistrict(name: string): boolean {
  return BD_DISTRICTS.some(d => d.name === name);
}