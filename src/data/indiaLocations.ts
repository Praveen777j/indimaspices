export interface StateData {
  state: string;
  districts: string[];
  majorCities: string[];
}

export const INDIA_STATES: StateData[] = [
  {
    state: 'Karnataka',
    districts: [
      'Bagalkot', 'Ballari (Bellary)', 'Belagavi (Belgaum)', 'Bengaluru Rural', 'Bengaluru Urban',
      'Bidar', 'Chamarajanagar', 'Chikkaballapur', 'Chikkamagaluru', 'Chitradurga',
      'Dakshina Kannada (Mangaluru)', 'Davanagere', 'Dharwad (Hubballi)', 'Gadag', 'Hassan',
      'Haveri', 'Kalaburagi (Gulbarga)', 'Kodagu (Coorg)', 'Kolar', 'Koppal',
      'Mandya', 'Mysuru (Mysore)', 'Raichur', 'Ramanagara', 'Shivamogga (Shimoga)',
      'Tumakuru (Tumkur)', 'Udupi', 'Uttara Kannada (Karwar)', 'Vijayanagara', 'Vijayapura (Bijapur)', 'Yadgir'
    ],
    majorCities: [
      'Bengaluru', 'Mysuru', 'Hubballi', 'Dharwad', 'Mangaluru', 'Belagavi', 'Shivamogga',
      'Davanagere', 'Tumakuru', 'Ballari', 'Vijayapura', 'Udupi', 'Hassan', 'Bidar',
      'Kalaburagi', 'Raichur', 'Kolar', 'Mandya', 'Chikkamagaluru', 'Madikeri (Coorg)'
    ]
  },
  {
    state: 'Maharashtra',
    districts: [
      'Ahmednagar', 'Akola', 'Amravati', 'Aurangabad (Chhatrapati Sambhajinagar)', 'Beed',
      'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli',
      'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur',
      'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad (Dharashiv)', 'Palghar', 'Parbhani',
      'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur',
      'Thane', 'Wardha', 'Washim', 'Yavatmal'
    ],
    majorCities: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Chhatrapati Sambhajinagar', 'Solapur', 'Kolhapur', 'Navi Mumbai', 'Amravati', 'Kalyan-Dombivli']
  },
  {
    state: 'Tamil Nadu',
    districts: [
      'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul',
      'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai',
      'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
      'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni',
      'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvallur',
      'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'
    ],
    majorCities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Thanjavur', 'Tiruppur', 'Kanchipuram']
  },
  {
    state: 'Kerala',
    districts: [
      'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 'Kottayam',
      'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'
    ],
    majorCities: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Kannur', 'Kottayam', 'Malappuram']
  },
  {
    state: 'Andhra Pradesh',
    districts: [
      'Alluri Sitharama Raju', 'Anakapalli', 'Ananthapuramu', 'Annamayya', 'Bapatla', 'Chittoor',
      'Dr. B.R. Ambedkar Konaseema', 'East Godavari', 'Eluru', 'Guntur', 'Kakinada', 'Krishna',
      'Kurnool', 'Nandyal', 'NTR', 'Palnadu', 'Parvathipuram Manyam', 'Prakasam', 'Sri Potti Sriramulu Nellore',
      'Sri Sathya Sai', 'Srikakulam', 'Tirupati', 'Visakhapatnam', 'Vizianagaram', 'West Godavari', 'YSR Kadapa'
    ],
    majorCities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati', 'Rajahmundry', 'Kakinada', 'Kadapa', 'Anantapur', 'Eluru']
  },
  {
    state: 'Telangana',
    districts: [
      'Adilabad', 'Bhadradri Kothagudem', 'Hyderabad', 'Jagtial', 'Jangaon', 'Jayashankar Bhupalpally',
      'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar', 'Khammam', 'Komaram Bheem Asifabad', 'Mahabubabad',
      'Mahabubnagar', 'Mancherial', 'Medak', 'Medchal-Malkajgiri', 'Mulugu', 'Nagarkurnool', 'Nalgonda',
      'Narayanpet', 'Nirmal', 'Nizamabad', 'Peddapalli', 'Rajanna Sircilla', 'Rangareddy', 'Sangareddy',
      'Siddipet', 'Suryapet', 'Vikarabad', 'Wanaparthy', 'Warangal', 'Hanamkonda', 'Yadadri Bhuvanagiri'
    ],
    majorCities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam', 'Mahabubnagar', 'Nalgonda', 'Adilabad', 'Secunderabad']
  },
  {
    state: 'Delhi (NCT)',
    districts: ['Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North East Delhi', 'North West Delhi', 'Shahdara', 'South Delhi', 'South East Delhi', 'South West Delhi', 'West Delhi'],
    majorCities: ['New Delhi', 'Delhi Cantt', 'Dwarka', 'Rohini', 'Connaught Place', 'Saket', 'Karol Bagh', 'Lajpat Nagar', 'Pitampura', 'Vasant Kunj']
  },
  {
    state: 'Gujarat',
    districts: [
      'Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch', 'Bhavnagar', 'Botad',
      'Chhota Udaipur', 'Dahod', 'Dang', 'Devbhoomi Dwarka', 'Gandhinagar', 'Gir Somnath', 'Jamnagar',
      'Junagadh', 'Kheda', 'Kutch', 'Mahisagar', 'Mehsana', 'Morbi', 'Narmada', 'Navsari',
      'Panchmahal', 'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar', 'Tapi', 'Vadodara', 'Valsad'
    ],
    majorCities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh', 'Anand', 'Navsari', 'Bharuch']
  },
  {
    state: 'Rajasthan',
    districts: [
      'Ajmer', 'Alwar', 'Banswara', 'Baran', 'Barmer', 'Bharatpur', 'Bhilwara', 'Bikaner', 'Bundi',
      'Chittorgarh', 'Churu', 'Dausa', 'Dholpur', 'Dungarpur', 'Hanumangarh', 'Jaipur', 'Jaisalmer',
      'Jalore', 'Jhalawar', 'Jhunjhunu', 'Jodhpur', 'Karauli', 'Kota', 'Nagaur', 'Pali', 'Pratapgarh',
      'Rajsamand', 'Sawai Madhopur', 'Sikar', 'Sirohi', 'Sri Ganganagar', 'Tonk', 'Udaipur'
    ],
    majorCities: ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar', 'Pali']
  },
  {
    state: 'Uttar Pradesh',
    districts: [
      'Agra', 'Aligarh', 'Ambedkar Nagar', 'Amethi', 'Amroha', 'Auraiya', 'Ayodhya', 'Azamgarh', 'Baghpat',
      'Bahraich', 'Ballia', 'Balrampur', 'Banda', 'Barabanki', 'Bareilly', 'Basti', 'Bhadohi', 'Bijnor',
      'Budaun', 'Bulandshahr', 'Chandauli', 'Chitrakoot', 'Deoria', 'Etah', 'Etawah', 'Farrukhabad',
      'Fatehpur', 'Firozabad', 'Gautam Buddha Nagar (Noida)', 'Ghaziabad', 'Ghazipur', 'Gonda', 'Gorakhpur',
      'Hamirpur', 'Hapur', 'Hardoi', 'Hathras', 'Jalaun', 'Jaunpur', 'Jhansi', 'Kannauj', 'Kanpur Dehat',
      'Kanpur Nagar', 'Kasganj', 'Kaushambi', 'Kheri', 'Kushinagar', 'Lalitpur', 'Lucknow', 'Maharajganj',
      'Mahoba', 'Mainpuri', 'Mathura', 'Mau', 'Meerut', 'Mirzapur', 'Moradabad', 'Muzaffarnagar',
      'Pilibhit', 'Pratapgarh', 'Prayagraj (Allahabad)', 'Raebareli', 'Rampur', 'Saharanpur', 'Sambhal',
      'Sant Kabir Nagar', 'Shahjahanpur', 'Shamli', 'Shravasti', 'Siddharthnagar', 'Sitapur', 'Sonbhadra',
      'Sultanpur', 'Unnao', 'Varanasi'
    ],
    majorCities: ['Lucknow', 'Kanpur', 'Noida', 'Ghaziabad', 'Agra', 'Varanasi', 'Prayagraj', 'Meerut', 'Bareilly', 'Aligarh', 'Gorakhpur', 'Mathura', 'Ayodhya', 'Jhansi']
  },
  {
    state: 'West Bengal',
    districts: ['Alipurduar', 'Bankura', 'Birbhum', 'Cooch Behar', 'Dakshin Dinajpur', 'Darjeeling', 'Hooghly', 'Howrah', 'Jalpaiguri', 'Jhargram', 'Kalimpong', 'Kolkata', 'Malda', 'Murshidabad', 'Nadia', 'North 24 Parganas', 'Paschim Bardhaman', 'Paschim Medinipur', 'Purba Bardhaman', 'Purba Medinipur', 'Purulia', 'South 24 Parganas', 'Uttar Dinajpur'],
    majorCities: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Kharagpur', 'Bardhaman', 'Malda', 'Darjeeling', 'Baharampur']
  },
  {
    state: 'Madhya Pradesh',
    districts: ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Katni', 'Singrauli', 'Burhanpur', 'Khandwa', 'Morena', 'Bhind', 'Chhindwara', 'Guna', 'Shivpuri', 'Vidisha'],
    majorCities: ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Burhanpur']
  },
  {
    state: 'Punjab',
    districts: ['Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib', 'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar', 'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Muktsar', 'Pathankot', 'Patiala', 'Rupnagar', 'Sahibzada Ajit Singh Nagar (Mohali)', 'Sangrur', 'Shahid Bhagat Singh Nagar', 'Sri Muktsar Sahib', 'Tarn Taran'],
    majorCities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Hoshiarpur', 'Pathankot', 'Moga']
  },
  {
    state: 'Haryana',
    districts: ['Ambala', 'Bhiwani', 'Charkhi Dadri', 'Faridabad', 'Fatehabad', 'Gurugram', 'Hisar', 'Jhajjar', 'Jind', 'Kaithal', 'Karnal', 'Kurukshetra', 'Mahendragarh', 'Nuh', 'Palwal', 'Panchkula', 'Panipat', 'Rewari', 'Rohtak', 'Sirsa', 'Sonipat', 'Yamunanagar'],
    majorCities: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula', 'Bahadurgarh']
  },
  {
    state: 'Goa',
    districts: ['North Goa', 'South Goa'],
    majorCities: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Curchorem']
  },
  {
    state: 'Odisha',
    districts: ['Angul', 'Balangir', 'Balasore', 'Bargarh', 'Bhadrak', 'Boudh', 'Cuttack', 'Deogarh', 'Dhenkanal', 'Gajapati', 'Ganjam', 'Jagatsinghpur', 'Jajpur', 'Jharsuguda', 'Kalahandi', 'Kandhamal', 'Kendrapara', 'Kendujhar', 'Khordha (Bhubaneswar)', 'Koraput', 'Malkangiri', 'Mayurbhanj', 'Nabarangpur', 'Nayagarh', 'Nuapada', 'Puri', 'Rayagada', 'Sambalpur', 'Subarnapur', 'Sundargarh'],
    majorCities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 'Baripada']
  },
  {
    state: 'Bihar',
    districts: ['Araria', 'Arwal', 'Aurangabad', 'Banka', 'Begusarai', 'Bhagalpur', 'Bhojpur', 'Buxar', 'Darbhanga', 'East Champaran', 'Gaya', 'Gopalganj', 'Jamui', 'Jehanabad', 'Kaimur', 'Katihar', 'Khagaria', 'Kishanganj', 'Lakhisarai', 'Madhepura', 'Madhubani', 'Munger', 'Muzaffarpur', 'Nalanda', 'Nawada', 'Patna', 'Purnia', 'Rohtas', 'Saharsa', 'Samastipur', 'Saran', 'Sheikhpura', 'Sheohar', 'Sitamarhi', 'Siwan', 'Supaul', 'Vaishali', 'West Champaran'],
    majorCities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar']
  },
  {
    state: 'Assam',
    districts: ['Baksa', 'Barpeta', 'Biswanath', 'Bongaigaon', 'Cachar', 'Charaideo', 'Chirang', 'Darrang', 'Dhemaji', 'Dhubri', 'Dibrugarh', 'Dima Hasao', 'Goalpara', 'Golaghat', 'Hailakandi', 'Hojai', 'Jorhat', 'Kamrup', 'Kamrup Metropolitan (Guwahati)', 'Karbi Anglong', 'Karimganj', 'Kokrajhar', 'Lakhimpur', 'Majuli', 'Morigaon', 'Nagaon', 'Nalbari', 'Sivasagar', 'Sonitpur', 'South Salmara-Mankachar', 'Tinsukia', 'Udalguri', 'West Karbi Anglong'],
    majorCities: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon', 'Karimganj']
  },
  {
    state: 'Chandigarh',
    districts: ['Chandigarh'],
    majorCities: ['Chandigarh', 'Sector 17', 'Sector 35', 'Manimajra']
  },
  {
    state: 'Puducherry',
    districts: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
    majorCities: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam', 'Oulgaret']
  },
  {
    state: 'Himachal Pradesh',
    districts: ['Bilaspur', 'Chamba', 'Hamirpur', 'Kangra', 'Kinnaur', 'Kullu', 'Lahaul and Spiti', 'Mandi', 'Shimla', 'Sirmaur', 'Solan', 'Una'],
    majorCities: ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Kullu', 'Manali', 'Una', 'Baddi', 'Palampur']
  },
  {
    state: 'Uttarakhand',
    districts: ['Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun', 'Haridwar', 'Nainital', 'Pauri Garhwal', 'Pithoragarh', 'Rudraprayag', 'Tehri Garhwal', 'Udham Singh Nagar', 'Uttarkashi'],
    majorCities: ['Dehradun', 'Haridwar', 'Rishikesh', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Nainital', 'Mussoorie']
  },
  {
    state: 'Jammu and Kashmir',
    districts: ['Anantnag', 'Bandipora', 'Baramulla', 'Budgam', 'Doda', 'Ganderbal', 'Jammu', 'Kathua', 'Kishtwar', 'Kulgam', 'Kupwara', 'Poonch', 'Pulwama', 'Rajouri', 'Ramban', 'Reasi', 'Samba', 'Shopian', 'Srinagar', 'Udhampur'],
    majorCities: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur', 'Kathua', 'Sopore']
  },
  {
    state: 'Ladakh',
    districts: ['Leh', 'Kargil'],
    majorCities: ['Leh', 'Kargil', 'Nubra', 'Drass']
  },
  {
    state: 'Jharkhand',
    districts: ['Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka', 'East Singhbhum (Jamshedpur)', 'Garhwa', 'Giridih', 'Godda', 'Gumla', 'Hazaribagh', 'Jamtara', 'Khunti', 'Koderma', 'Latehar', 'Lohardaga', 'Pakur', 'Palamu', 'Ramgarh', 'Ranchi', 'Sahibganj', 'Seraikela Kharsawan', 'Simdega', 'West Singhbhum'],
    majorCities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro Steel City', 'Deoghar', 'Hazaribagh', 'Giridih']
  },
  {
    state: 'Chhattisgarh',
    districts: ['Balod', 'Baloda Bazar', 'Balrampur', 'Bastar', 'Bemetara', 'Bijapur', 'Bilaspur', 'Dantewada', 'Dhamtari', 'Durg', 'Gariaband', 'Janjgir-Champa', 'Jashpur', 'Kabirdham', 'Kanker', 'Kondagaon', 'Korba', 'Koriya', 'Mahasamund', 'Mungeli', 'Narayanpur', 'Raigarh', 'Raipur', 'Rajnandgaon', 'Sukma', 'Surajpur', 'Surguja'],
    majorCities: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Rajnandgaon', 'Jagdalpur', 'Durg', 'Ambikapur']
  },
  {
    state: 'Andaman and Nicobar Islands',
    districts: ['Nicobar', 'North and Middle Andaman', 'South Andaman'],
    majorCities: ['Port Blair', 'Diglipur', 'Garacharma', 'Bambooflat']
  },
  {
    state: 'Dadra and Nagar Haveli and Daman and Diu',
    districts: ['Dadra and Nagar Haveli', 'Daman', 'Diu'],
    majorCities: ['Silvassa', 'Daman', 'Diu']
  },
  {
    state: 'Lakshadweep',
    districts: ['Lakshadweep'],
    majorCities: ['Kavaratti', 'Agatti', 'Amini', 'Andrott']
  },
  {
    state: 'Arunachal Pradesh',
    districts: ['Anjaw', 'Changlang', 'Dibang Valley', 'East Kameng', 'East Siang', 'Kamle', 'Kra Daadi', 'Kurung Kumey', 'Leparada', 'Lohit', 'Longding', 'Lower Dibang Valley', 'Lower Siang', 'Lower Subansiri', 'Namsai', 'Pakke Kessang', 'Papum Pare', 'Shi Yomi', 'Siang', 'Tawang', 'Tirap', 'Upper Siang', 'Upper Subansiri', 'West Kameng', 'West Siang'],
    majorCities: ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro']
  },
  {
    state: 'Manipur',
    districts: ['Bishnupur', 'Chandel', 'Churachandpur', 'Imphal East', 'Imphal West', 'Jiribam', 'Kakching', 'Kamjong', 'Kangpokpi', 'Noney', 'Pherzawl', 'Senapati', 'Tamenglong', 'Tengnoupal', 'Thoubal', 'Ukhrul'],
    majorCities: ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Kakching']
  },
  {
    state: 'Meghalaya',
    districts: ['East Garo Hills', 'East Jaintia Hills', 'East Khasi Hills', 'North Garo Hills', 'Ri Bhoi', 'South Garo Hills', 'South West Garo Hills', 'South West Khasi Hills', 'West Garo Hills', 'West Jaintia Hills', 'West Khasi Hills'],
    majorCities: ['Shillong', 'Tura', 'Jowai', 'Nongpoh', 'Williamnagar']
  },
  {
    state: 'Mizoram',
    districts: ['Aizawl', 'Champhai', 'Hnahthial', 'Khawzawl', 'Kolasib', 'Lawngtlai', 'Lunglei', 'Mamit', 'Saiha', 'Saitual', 'Serchhip'],
    majorCities: ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip', 'Kolasib']
  },
  {
    state: 'Nagaland',
    districts: ['Chumoukedima', 'Dimapur', 'Kiphire', 'Kohima', 'Longleng', 'Mokokchung', 'Mon', 'Niuland', 'Noklak', 'Peren', 'Phek', 'Shamator', 'Tseminyu', 'Tuensang', 'Wokha', 'Zunheboto'],
    majorCities: ['Dimapur', 'Kohima', 'Mokokchung', 'Tuensang', 'Wokha']
  },
  {
    state: 'Sikkim',
    districts: ['East Sikkim (Gangtok)', 'North Sikkim (Mangan)', 'Pakyong', 'Soreng', 'South Sikkim (Namchi)', 'West Sikkim (Gyalshing)'],
    majorCities: ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan', 'Rangpo']
  },
  {
    state: 'Tripura',
    districts: ['Dhalai', 'Gomati', 'Khowai', 'North Tripura', 'Sepahijala', 'South Tripura', 'Unakoti', 'West Tripura'],
    majorCities: ['Agartala', 'Dharmanagar', 'Udaipur', 'Kailashahar', 'Belonia']
  }
];

// PIN Code Prefix Map for Instant Pan-India Lookup
export interface PincodeLookupResult {
  pincode: string;
  state: string;
  district: string;
  city: string;
  area: string;
}

export function lookupPincode(pincode: string): PincodeLookupResult | null {
  if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
    return null;
  }

  const prefix2 = pincode.substring(0, 2);
  const prefix3 = pincode.substring(0, 3);

  // Exact sample lookups for major Karnataka & Pan India hubs
  const exactMap: Record<string, { state: string; district: string; city: string; area: string }> = {
    // Bangalore
    '560001': { state: 'Karnataka', district: 'Bengaluru Urban', city: 'Bengaluru', area: 'GPO / MG Road / Brigade Road' },
    '560002': { state: 'Karnataka', district: 'Bengaluru Urban', city: 'Bengaluru', area: 'City Market / Chickpet' },
    '560004': { state: 'Karnataka', district: 'Bengaluru Urban', city: 'Bengaluru', area: 'Basavanagudi / VV Puram' },
    '560011': { state: 'Karnataka', district: 'Bengaluru Urban', city: 'Bengaluru', area: 'Jayanagar' },
    '560034': { state: 'Karnataka', district: 'Bengaluru Urban', city: 'Bengaluru', area: 'Koramangala' },
    '560038': { state: 'Karnataka', district: 'Bengaluru Urban', city: 'Bengaluru', area: 'Indiranagar' },
    '560066': { state: 'Karnataka', district: 'Bengaluru Urban', city: 'Bengaluru', area: 'Whitefield' },
    '560078': { state: 'Karnataka', district: 'Bengaluru Urban', city: 'Bengaluru', area: 'JP Nagar' },
    '560100': { state: 'Karnataka', district: 'Bengaluru Urban', city: 'Bengaluru', area: 'Electronic City' },
    '560102': { state: 'Karnataka', district: 'Bengaluru Urban', city: 'Bengaluru', area: 'HSR Layout' },
    '560092': { state: 'Karnataka', district: 'Bengaluru Urban', city: 'Bengaluru', area: 'Hebbal' },
    '560064': { state: 'Karnataka', district: 'Bengaluru Urban', city: 'Bengaluru', area: 'Yelahanka' },
    '560076': { state: 'Karnataka', district: 'Bengaluru Urban', city: 'Bengaluru', area: 'Bannerghatta Road / BTM Layout' },
    '560003': { state: 'Karnataka', district: 'Bengaluru Urban', city: 'Bengaluru', area: 'Malleshwaram' },
    '560085': { state: 'Karnataka', district: 'Bengaluru Urban', city: 'Bengaluru', area: 'Banashankari 3rd Stage' },
    '560040': { state: 'Karnataka', district: 'Bengaluru Urban', city: 'Bengaluru', area: 'Vijayanagar' },
    '560086': { state: 'Karnataka', district: 'Bengaluru Urban', city: 'Bengaluru', area: 'Mahalakshmi Layout' },
    '560037': { state: 'Karnataka', district: 'Bengaluru Urban', city: 'Bengaluru', area: 'Marathahalli' },
    // Mysore
    '570001': { state: 'Karnataka', district: 'Mysuru (Mysore)', city: 'Mysuru', area: 'Mysuru City / Devaraja Market' },
    '570004': { state: 'Karnataka', district: 'Mysuru (Mysore)', city: 'Mysuru', area: 'Kuvempunagar' },
    '570020': { state: 'Karnataka', district: 'Mysuru (Mysore)', city: 'Mysuru', area: 'Vijayanagar' },
    // Mangaluru & Udupi
    '575001': { state: 'Karnataka', district: 'Dakshina Kannada (Mangaluru)', city: 'Mangaluru', area: 'Hampankatta / Car Street' },
    '575003': { state: 'Karnataka', district: 'Dakshina Kannada (Mangaluru)', city: 'Mangaluru', area: 'Kadri / Mallikatta' },
    '576101': { state: 'Karnataka', district: 'Udupi', city: 'Udupi', area: 'Udupi Town / Sri Krishna Temple' },
    '576104': { state: 'Karnataka', district: 'Udupi', city: 'Manipal', area: 'Manipal' },
    // Hubballi-Dharwad & Belagavi
    '580020': { state: 'Karnataka', district: 'Dharwad (Hubballi)', city: 'Hubballi', area: 'Vidyanagar' },
    '580001': { state: 'Karnataka', district: 'Dharwad (Hubballi)', city: 'Dharwad', area: 'Dharwad Market' },
    '590001': { state: 'Karnataka', district: 'Belagavi (Belgaum)', city: 'Belagavi', area: 'Belagavi City' },
    // Shimoga & Coorg
    '577201': { state: 'Karnataka', district: 'Shivamogga (Shimoga)', city: 'Shivamogga', area: 'Shivamogga Central' },
    '571201': { state: 'Karnataka', district: 'Kodagu (Coorg)', city: 'Madikeri (Coorg)', area: 'Madikeri Town' },
    // Mumbai
    '400001': { state: 'Maharashtra', district: 'Mumbai City', city: 'Mumbai', area: 'Fort / Colaba' },
    '400050': { state: 'Maharashtra', district: 'Mumbai Suburban', city: 'Mumbai', area: 'Bandra West' },
    '411001': { state: 'Maharashtra', district: 'Pune', city: 'Pune', area: 'Pune Station / Camp' },
    '411038': { state: 'Maharashtra', district: 'Pune', city: 'Pune', area: 'Kothrud' },
    // Delhi
    '110001': { state: 'Delhi (NCT)', district: 'New Delhi', city: 'New Delhi', area: 'Connaught Place' },
    '110016': { state: 'Delhi (NCT)', district: 'South Delhi', city: 'New Delhi', area: 'Hauz Khas' },
    '110085': { state: 'Delhi (NCT)', district: 'North West Delhi', city: 'Rohini', area: 'Rohini Sector 7' },
    // Chennai
    '600001': { state: 'Tamil Nadu', district: 'Chennai', city: 'Chennai', area: 'George Town / Parrys' },
    '600034': { state: 'Tamil Nadu', district: 'Chennai', city: 'Chennai', area: 'Nungambakkam' },
    '600028': { state: 'Tamil Nadu', district: 'Chennai', city: 'Chennai', area: 'Mylapore' },
    // Hyderabad
    '500001': { state: 'Telangana', district: 'Hyderabad', city: 'Hyderabad', area: 'Abids / Koti' },
    '500081': { state: 'Telangana', district: 'Hyderabad', city: 'Hyderabad', area: 'Madhapur / Hitec City' },
    '500034': { state: 'Telangana', district: 'Hyderabad', city: 'Hyderabad', area: 'Banjara Hills' },
    // Kochi & Trivandrum
    '682001': { state: 'Kerala', district: 'Ernakulam', city: 'Kochi', area: 'Fort Kochi' },
    '695001': { state: 'Kerala', district: 'Thiruvananthapuram', city: 'Thiruvananthapuram', area: 'Palayam / Secretariat' },
    // Kolkata
    '700001': { state: 'West Bengal', district: 'Kolkata', city: 'Kolkata', area: 'BBD Bagh / Dalhousie' },
    '700091': { state: 'West Bengal', district: 'North 24 Parganas', city: 'Kolkata', area: 'Salt Lake Sector V' }
  };

  if (exactMap[pincode]) {
    return { pincode, ...exactMap[pincode] };
  }

  // Postal Range Fallback logic based on Indian Postal Circle Prefixes:
  if (prefix2 >= '56' && prefix2 <= '59') {
    let dist = 'Bengaluru Urban';
    let city = 'Bengaluru';
    if (prefix2 === '57') {
      dist = prefix3.startsWith('570') ? 'Mysuru (Mysore)' : prefix3.startsWith('575') ? 'Dakshina Kannada (Mangaluru)' : 'Udupi';
      city = prefix3.startsWith('570') ? 'Mysuru' : prefix3.startsWith('575') ? 'Mangaluru' : 'Udupi';
    } else if (prefix2 === '58') {
      dist = 'Dharwad (Hubballi)';
      city = 'Hubballi';
    } else if (prefix2 === '59') {
      dist = 'Belagavi (Belgaum)';
      city = 'Belagavi';
    }
    return {
      pincode,
      state: 'Karnataka',
      district: dist,
      city: city,
      area: `Locality (Pin ${pincode})`
    };
  } else if (prefix2 >= '40' && prefix2 <= '44') {
    return {
      pincode,
      state: 'Maharashtra',
      district: prefix2 === '40' ? 'Mumbai City' : prefix2 === '41' ? 'Pune' : 'Nagpur',
      city: prefix2 === '40' ? 'Mumbai' : prefix2 === '41' ? 'Pune' : 'Nagpur',
      area: `Area (Pin ${pincode})`
    };
  } else if (prefix2 >= '60' && prefix2 <= '64') {
    return {
      pincode,
      state: 'Tamil Nadu',
      district: prefix2 === '60' ? 'Chennai' : prefix2 === '64' ? 'Coimbatore' : 'Madurai',
      city: prefix2 === '60' ? 'Chennai' : prefix2 === '64' ? 'Coimbatore' : 'Madurai',
      area: `Area (Pin ${pincode})`
    };
  } else if (prefix2 >= '67' && prefix2 <= '69') {
    return {
      pincode,
      state: 'Kerala',
      district: prefix2 === '68' ? 'Ernakulam' : prefix2 === '69' ? 'Thiruvananthapuram' : 'Kozhikode',
      city: prefix2 === '68' ? 'Kochi' : prefix2 === '69' ? 'Thiruvananthapuram' : 'Kozhikode',
      area: `Area (Pin ${pincode})`
    };
  } else if (prefix2 === '50') {
    return {
      pincode,
      state: 'Telangana',
      district: 'Hyderabad',
      city: 'Hyderabad',
      area: `Hyderabad Locality (Pin ${pincode})`
    };
  } else if (prefix2 >= '51' && prefix2 <= '53') {
    return {
      pincode,
      state: 'Andhra Pradesh',
      district: prefix2 === '53' ? 'Visakhapatnam' : 'Vijayawada',
      city: prefix2 === '53' ? 'Visakhapatnam' : 'Vijayawada',
      area: `Area (Pin ${pincode})`
    };
  } else if (prefix2 === '11') {
    return {
      pincode,
      state: 'Delhi (NCT)',
      district: 'New Delhi',
      city: 'New Delhi',
      area: `New Delhi (Pin ${pincode})`
    };
  } else if (prefix2 >= '36' && prefix2 <= '39') {
    return {
      pincode,
      state: 'Gujarat',
      district: prefix2 === '38' ? 'Ahmedabad' : prefix2 === '39' ? 'Surat' : 'Vadodara',
      city: prefix2 === '38' ? 'Ahmedabad' : prefix2 === '39' ? 'Surat' : 'Vadodara',
      area: `Area (Pin ${pincode})`
    };
  } else if (prefix2 >= '30' && prefix2 <= '34') {
    return {
      pincode,
      state: 'Rajasthan',
      district: prefix2 === '30' ? 'Jaipur' : 'Jodhpur',
      city: prefix2 === '30' ? 'Jaipur' : 'Jodhpur',
      area: `Area (Pin ${pincode})`
    };
  } else if (prefix2 >= '20' && prefix2 <= '28') {
    return {
      pincode,
      state: 'Uttar Pradesh',
      district: prefix2 === '22' ? 'Lucknow' : prefix2 === '20' ? 'Gautam Buddha Nagar (Noida)' : 'Varanasi',
      city: prefix2 === '22' ? 'Lucknow' : prefix2 === '20' ? 'Noida' : 'Varanasi',
      area: `Area (Pin ${pincode})`
    };
  } else if (prefix2 >= '70' && prefix2 <= '74') {
    return {
      pincode,
      state: 'West Bengal',
      district: 'Kolkata',
      city: 'Kolkata',
      area: `Kolkata Locality (Pin ${pincode})`
    };
  } else if (prefix2 >= '45' && prefix2 <= '49') {
    return {
      pincode,
      state: prefix2 === '49' ? 'Chhattisgarh' : 'Madhya Pradesh',
      district: prefix2 === '45' ? 'Indore' : prefix2 === '46' ? 'Bhopal' : 'Raipur',
      city: prefix2 === '45' ? 'Indore' : prefix2 === '46' ? 'Bhopal' : 'Raipur',
      area: `Area (Pin ${pincode})`
    };
  } else if (prefix2 >= '14' && prefix2 <= '16') {
    return {
      pincode,
      state: 'Punjab',
      district: prefix2 === '14' ? 'Amritsar' : 'Ludhiana',
      city: prefix2 === '14' ? 'Amritsar' : 'Ludhiana',
      area: `Area (Pin ${pincode})`
    };
  } else if (prefix2 >= '12' && prefix2 <= '13') {
    return {
      pincode,
      state: 'Haryana',
      district: prefix2 === '12' ? 'Gurugram' : 'Faridabad',
      city: prefix2 === '12' ? 'Gurugram' : 'Faridabad',
      area: `Area (Pin ${pincode})`
    };
  } else if (prefix2 >= '80' && prefix2 <= '85') {
    return {
      pincode,
      state: prefix2 <= '83' ? 'Bihar' : 'Jharkhand',
      district: prefix2 <= '83' ? 'Patna' : 'Ranchi',
      city: prefix2 <= '83' ? 'Patna' : 'Ranchi',
      area: `Area (Pin ${pincode})`
    };
  } else if (prefix2 >= '75' && prefix2 <= '77') {
    return {
      pincode,
      state: 'Odisha',
      district: 'Bhubaneswar',
      city: 'Bhubaneswar',
      area: `Area (Pin ${pincode})`
    };
  } else if (prefix2 === '78') {
    return {
      pincode,
      state: 'Assam',
      district: 'Kamrup Metropolitan (Guwahati)',
      city: 'Guwahati',
      area: `Guwahati (Pin ${pincode})`
    };
  } else if (prefix2 === '79') {
    return {
      pincode,
      state: 'Meghalaya',
      district: 'East Khasi Hills',
      city: 'Shillong',
      area: `Area (Pin ${pincode})`
    };
  }

  // Universal Fallback for any other valid 6 digit code in India
  return {
    pincode,
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    city: 'Bengaluru',
    area: `Locality (Pin ${pincode})`
  };
}
