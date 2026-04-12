export const INDIAN_REGIONS = [
  { name: "Andaman and Nicobar Islands", cities: ["Port Blair", "Diglipur", "Mayabunder", "Rangat"] },
  { name: "Andhra Pradesh", cities: ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati", "Kurnool", "Nellore"] },
  { name: "Arunachal Pradesh", cities: ["Itanagar", "Naharlagun", "Tawang", "Pasighat", "Ziro"] },
  { name: "Assam", cities: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tezpur"] },
  { name: "Bihar", cities: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga"] },
  { name: "Chandigarh", cities: ["Chandigarh"] },
  { name: "Chhattisgarh", cities: ["Raipur", "Bhilai", "Bilaspur", "Durg", "Korba", "Rajnandgaon"] },
  {
    name: "Dadra and Nagar Haveli and Daman and Diu",
    cities: ["Daman", "Diu", "Silvassa"],
  },
  { name: "Delhi", cities: ["New Delhi", "Central Delhi", "Dwarka", "Rohini", "Saket", "Karol Bagh"] },
  { name: "Goa", cities: ["Panaji", "Margao", "Mapusa", "Ponda", "Vasco da Gama"] },
  { name: "Gujarat", cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar"] },
  { name: "Haryana", cities: ["Faridabad", "Gurugram", "Panipat", "Hisar", "Rohtak", "Jhajjar"] },
  { name: "Himachal Pradesh", cities: ["Shimla", "Mandi", "Solan", "Dharamshala", "Hamirpur", "Kullu"] },
  { name: "Jammu and Kashmir", cities: ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Pulwama"] },
  { name: "Jharkhand", cities: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh"] },
  { name: "Karnataka", cities: ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi", "Kalaburagi"] },
  { name: "Kerala", cities: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kannur", "Kollam"] },
  { name: "Ladakh", cities: ["Leh", "Kargil"] },
  { name: "Lakshadweep", cities: ["Kavaratti", "Agatti", "Amini"] },
  { name: "Madhya Pradesh", cities: ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar"] },
  { name: "Maharashtra", cities: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane"] },
  { name: "Manipur", cities: ["Imphal", "Thoubal", "Bishnupur", "Churachandpur"] },
  { name: "Meghalaya", cities: ["Shillong", "Tura", "Jowai", "Nongpoh"] },
  { name: "Mizoram", cities: ["Aizawl", "Lunglei", "Champhai", "Kolasib"] },
  { name: "Nagaland", cities: ["Kohima", "Dimapur", "Mokokchung", "Tuensang"] },
  { name: "Odisha", cities: ["Bhubaneswar", "Cuttack", "Rourkela", "Puri", "Berhampur", "Sambalpur"] },
  { name: "Puducherry", cities: ["Puducherry", "Karaikal", "Mahe", "Yanam"] },
  { name: "Punjab", cities: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali"] },
  { name: "Rajasthan", cities: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner"] },
  { name: "Sikkim", cities: ["Gangtok", "Namchi", "Gyalshing", "Mangan"] },
  { name: "Tamil Nadu", cities: ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli", "Tirunelveli"] },
  { name: "Telangana", cities: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Mahabubnagar"] },
  { name: "Tripura", cities: ["Agartala", "Dharmanagar", "Udaipur", "Kailasahar"] },
  { name: "Uttar Pradesh", cities: ["Lucknow", "Kanpur", "Varanasi", "Prayagraj", "Agra", "Meerut"] },
  { name: "Uttarakhand", cities: ["Dehradun", "Haridwar", "Haldwani", "Roorkee", "Rudrapur", "Nainital"] },
  { name: "West Bengal", cities: ["Kolkata", "Howrah", "Siliguri", "Durgapur", "Asansol", "Kharagpur"] },
] as const;

export const INDIAN_REGION_NAMES = INDIAN_REGIONS.map((region) => region.name);

export function getCitiesForRegion(regionName?: string | null) {
  if (!regionName) return [];
  return INDIAN_REGIONS.find((region) => region.name === regionName)?.cities ?? [];
}
