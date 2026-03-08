export interface LocationData {
    provinces: string[];
    cities: Record<string, string[]>;
    barangays: Record<string, Record<string, string[]>>;
}

export const locationData: LocationData = {
    provinces: [
        "Davao del Sur",
        "Davao del Norte",
        "Davao de Oro",
        "Davao Oriental",
        "Davao Occidental",
        "Agusan del Sur",
        "Surigao del Sur",
        "Bukidnon",
        "Compostela Valley",
        "Cotabato"
    ],
    cities: {
        "Davao del Norte": ["Tagum City", "Panabo City", "Samal City", "Samal Island", "Asuncion", "Braulio E. Dujali", "Dujali", "Carmen", "Kapalong", "New Corella", "San Isidro", "Santo Tomas", "Sto Thomas", "Talaingod"],
        "Davao del Sur": ["Davao City", "Digos City", "Bansalan", "Hagonoy", "Kiblawan", "Magsaysay", "Malalag", "Matanao", "Padada", "Santa Cruz", "Sulop"],
        "Davao de Oro": ["Nabunturan", "Compostela", "Laak", "Mabini", "Maco", "Maragusan", "Mawab", "Monkayo", "Montevista", "New Bataan", "Pantukan"],
        "Davao Oriental": ["Mati City", "Baganga", "Banaybanay", "Boston", "Caraga", "Cateel", "Governor Generoso", "Lupon", "Manay", "San Isidro", "Tarragona"],
        "Davao Occidental": ["Malita", "Don Marcelino", "Jose Abad Santos", "Santa Maria", "Cateel"],
        "Agusan del Sur": ["Bayugan City", "Bunawan", "Esperanza", "La Paz", "Loreto", "Prosperidad", "Rosario", "San Francisco", "San Luis", "Santa Josefa", "Sibagat", "Talacogon", "Trento", "Veruela", "Butuan City"],
        "Surigao del Sur": ["Bislig City", "Tandag City", "Barobo", "Bayabas", "Cagwait", "Cantilan", "Carmen", "Carrascal", "Cortes", "Hinatuan", "Lanuza", "Lianga", "Lingig", "Madrid", "Marihatag", "San Agustin", "San Miguel", "Tagbina", "Tago", "Gigaquit", "Asuncion"],
        "Bukidnon": ["Malaybalay City", "Valencia City", "Baungon", "Cabanglasan", "Damulog", "Dangcagan", "Don Carlos", "Impasugong", "Maramag", "Malabalay City"],
        "Compostela Valley": ["Nabunturan", "Mabini", "Montevista", "New Bataan", "Pantukan", "Laak", "Maco", "Maragusan", "Mawab", "Monkayo", "Compostela"],
        "Cotabato": ["Kidapawan", "Kidapawan City", "North Cotabato", "M'lang", "Makilala", "Magpet", "President Roxas", "Tulunan", "Antipas", "Arakan", "Banisilan", "Carmen", "Kabacan", "Libungan", "Matalam", "Pigcawayan", "Pigkawayan", "Pikit", "Aleosan"]
    },
    barangays: {
        "Davao del Norte": {
            "Tagum City": ["Apokon", "Bincungan", "La Filipina", "Magugpo East", "Magugpo North", "Magugpo Poblacion", "Magugpo South", "Mankilam", "Nueva Fuerza", "Pagsabangan", "San Agustin", "San Miguel", "Visayan Village", "Busaon", "Liboganon", "Madaum", "Canucotan", "Bingcungan", "Suwawon", "Magnum", "New Corella", "Dujali"],
            "Panabo City": ["A.O. Floirendo", "Cagangohan", "Datu Abdul Dadia", "Gredu", "J.P. Laurel", "Kasilak", "Kauswagan", "Little Panay", "Mabunao", "Malativas", "Nanyo", "Malaga", "New Malaga", "New Malitbog", "New Pandan", "Quezon", "San Francisco", "San Fransisco", "San Nicolas", "San Pedro", "San Roque", "San Vicente", "Santo Niño", "Waterfall", "Sto. Niño", "Sto. Nino", "New Visayas", "Southern Davao", "Licanan", "Upper Licanan", "Lower Panaga", "Camiling", "Calinan", "Manay", "Datu Abdul", "Malitbog", "Quilisando", "Dujali", "Tubod", "JP Laurel", "Pagro", "Arguelles", "Maduao", "Homeland", "Deco Subdivision", "Dapco Farm 2", "Consolacion", "Gamao", "Salvacion", "Sindaton"],
            "Samal City": ["Adecor", "Anonang", "Aumbay", "Babak", "Caliclic", "Camudmud", "Cawag", "Cogon", "Dadiangas", "Guilon", "Kanaan", "Kinawitnon", "Licoan", "Limao", "Miranda", "Pangubatan", "Penaplata", "Poblacion", "San Isidro", "San Miguel", "San Remigio", "Sion", "Tagbaobo", "Tagpopongan", "Tambo", "Tokawal"],
            "Samal Island": ["Malaga", "Anonang"],
            "Asuncion": ["Bapa", "Candiis", "Concepcion", "New Corella", "Poblacion", "San Vicente", "Sonlon", "Tubalan"],
            "Braulio E. Dujali": ["Cabayangan", "Dujali", "Magupising", "New Casay", "Tanglaw"],
            "Dujali": ["Cabayangan", "Dujali", "Magupising", "New Casay", "Tanglaw"],
            "Carmen": ["Alejal", "Asuncion", "Bincungan", "Carmen", "Ising", "Lapaz", "Mabuhay", "Mabini", "Magsaysay", "Poblacion", "San Agustin", "Sto. Niño", "Sto. Nino", "Tubod", "Mangalcal", "Mangalkal", "Mabunao", "Tibulao"],
            "Kapalong": ["Semong", "Florida", "Gabuyan", "Gupitan", "Capungagan", "Katipunan", "Luna", "Mabantao", "Mamacao", "Pag-asa", "Maniki (Poblacion)", "Sampao", "Sua-on", "Tiburcia"],
            "New Corella": ["Cabidianan", "Carcor", "Del Monte", "Del Pilar", "El Salvador", "Limba-an", "Macgum", "Mambing", "Mesaoy", "New Bohol", "New Cortez", "New Sambog", "Patrocenio", "Poblacion", "San Roque", "Santa Cruz", "Santa Fe", "Santo Niño", "Suawon", "San Jose"],
            "San Isidro": ["Dacudao", "Datu Balong", "Igangon", "Kipalili", "Libuton", "Linao", "Mamangan", "Monte Dujali", "Pinamuno", "Sabangan", "San Miguel", "Santo Niño", "Sawata"],
            "Santo Tomas": ["Balagunan", "Bobongon", "Casig-Ang", "Esperanza", "Kimamon", "Kinamayan", "La Libertad", "Lungaog", "Magwawa", "New Katipunan", "New Visayas", "Pantaron", "Salvacion", "San Jose", "San Miguel", "San Vicente", "Talomo", "Tibal-og", "Tulalian", "Bulahan", "Babongon", "Balayunan", "Malitbog", "Maniki"],
            "Sto Thomas": ["Balagunan", "Bobongon", "Casig-Ang", "Esperanza", "Kimamon", "Kinamayan", "La Libertad", "Lungaog", "Magwawa", "New Katipunan", "New Visayas", "Pantaron", "Salvacion", "San Jose", "San Miguel", "San Vicente", "Talomo", "Tibal-og", "Tulalian", "Bulahan", "Babongon", "Balayunan", "Malitbog", "Maniki"],
            "Talaingod": ["Dagohoy", "Palma Gil", "Santo Niño"]
        },
        "Davao del Sur": {
            "Davao City": ["Agdao", "Alambre", "Atan-awe", "Bago Aplaya", "Bago Gallera", "Baliok", "Biao Escuela", "Biao Guianga", "Biao Joaquin", "Binugao", "Buhangin", "Bunawan", "Cabantian", "Cadalian", "Calinan", "Carmen", "Catalunan Grande", "Catalunan Pequeño", "Catitipan", "Central Business District", "Daliao", "Dumoy", "Eden", "Fatima", "Indangan", "Lamanan", "Lampianao", "Leon Garcia", "Ma-a", "Maa", "Magsaysay", "Mahayag", "Malabog", "Manambulan", "Mandug", "Marilog", "Matina Aplaya", "Matina Crossing", "Matina Pangi", "Mintal", "Mulig", "New Carmen", "New Valencia", "Pampanga", "Panacan", "Paquibato", "Paradise Embac", "Riverside", "Salapawan", "San Antonio", "Sirawan", "Sirao", "Tacunan", "Tagluno", "Tagurano", "Talomo", "Tamayong", "Tamugan", "Tapak", "Tawan-tawan", "Tibuloy", "Tibungco", "Toril", "Tugbok", "Waan", "Wines", "Sasa", "Bajada", "Umoy", "Libra Tambongon", "Lumiad"],
            "Digos City": ["Aplaya", "Balabag", "Biao", "Binaton", "Cogon", "Colorado", "Dulangan", "Goma", "Igpit", "Kapatagan", "Kiagot", "Mahayahay", "Matti", "Meta", "Palili", "Poblacion", "San Agustin", "San Jose", "San Miguel", "Sinawilan", "Soong", "Tres de Mayo", "Zone I", "Zone II", "Zone III"],
            "Bansalan": ["Anonang", "Bitaug", "Darapuay", "Dolo", "Kinuskusan", "Libertad", "Linawan", "Mabini", "Mabunga", "Managa", "Marber", "New Clarin", "Poblacion", "Siblag", "Tinongcop"],
            "Hagonoy": ["Balutakay", "Clib", "Guihing", "Guihing Aplaya", "Hagonoy Crossing", "Kibuaya", "La Union", "Lanuro", "Lapulabao", "Leling", "Mahayahay", "Malabang Damsite", "Maliit Digos", "New Quezon", "Paligue", "Poblacion", "Sacub", "San Guillermo", "San Isidro", "Sinayawan", "Tologan"],
            "Kiblawan": ["Abnate", "Bagong Negros", "Bagong Silang", "Bagumbayan", "Balasiao", "Bonifacio", "Bulol-Salo", "Bunot", "Cogon-Bacaca", "Dapok", "Ihan", "Kibongbong", "Kimlawis", "Kisulan", "Lati-an", "Manual", "Maraga-a", "Molopolo", "New Sibonga", "Panaglib", "Pasig", "Poblacion", "Pocaleel", "San Isidro", "San Jose", "Santo Niño", "Tacub", "Tacul", "Waterfall", "Yanil"],
            "Magsaysay": ["Bacungan", "Balnate", "Barayong", "Blocon", "Dalawinon", "Dalumay", "Glamang", "Kanapulo", "Kasuga", "Lower Bala", "Mabini", "Maibo", "Malawanit", "Malongon", "New Ilocos", "New Opon", "Poblacion", "San Isidro", "San Miguel", "Tacul", "Tagaytay", "Upper Bala"],
            "Malalag": ["Bagumbayan", "Baybay", "Bolton", "Bulacan", "Caputian", "Ibo", "Kiblagon", "Lapu-Lapu", "Mabini", "New Baclayon", "Pitu", "Poblacion", "Rizal", "San Isidro", "Tagansule"],
            "Matanao": ["Asbang", "Asinan", "Bagumbayan", "Bangkal", "Buas", "Buri", "Cabligan", "Camanchiles", "Ceboza", "Colonsabak", "Dongan-Pekong", "Kabasagan", "Kapok", "Kauswagan", "Kibao", "La Suerte", "Langa-an", "Lower Marber", "Manga", "New Katipunan", "New Murcia", "New Visayas", "Poblacion", "Saboy", "San Jose", "San Miguel", "San Vicente", "Saub", "Sinaragan", "Sinawilan", "Tamlangon", "Tibongbong", "Towak"],
            "Padada": ["Almendras", "Don Sergio Osmeña, Sr.", "Harada Butai", "Lower Katipunan", "Lower Limonzo", "Lower Malinao", "N.C. Ordaneza District", "Northern Paligue", "Palili", "Piape", "Punta Piape", "Quirino District", "San Isidro", "Southern Paligue", "Tulogan", "Upper Limonzo", "Upper Malinao"],
            "Santa Cruz": ["Astorga", "Bato", "Coronon", "Darong", "Inawayan", "Jose Rizal", "Matutungan", "Melilia", "Saliducon", "Sibulan", "Sinoron", "Tagabuli", "Tibolo", "Tuban", "Zone I", "Zone II"],
            "Sulop": ["Balasinon", "Buguis", "Carre", "Clib", "Harada Butai", "Katipunan", "Kiblagon", "Labon", "Laperas", "Lapla", "Litos", "Luparan", "Mckinley", "New Cebu", "Osmeña", "Palili", "Parame", "Poblacion", "Roxas", "Solongvale", "Tagolilong", "Tala-o", "Talas", "Tanwalang", "Waterfall"]
        },
        "Davao de Oro": {
            "Nabunturan": ["Anislagan", "Antequera", "Basak", "Bucal", "Cabidianan", "Katipunan", "Magading", "Magsaysay", "Nabunturan", "Pandasan", "Poblacion", "San Vicente"],
            "Compostela": ["Bagongsilang", "Gabi", "Lagab", "Mangayon", "Mapaca", "Ngan", "New Leyte", "New Panay", "Osmeña", "Poblacion", "Siocon"],
            "Laak": ["Aguinaldo", "Amor Cruz", "Ampawid", "Andap", "Anitap", "Adnap", "Bagong Silang", "Banbanon", "Belmonte", "Binasbas", "Bullucan", "Cebulida", "Concepcion", "Datu Ampunan", "Datu Davao", "Doña Josefa", "El Katipunan", "Il Papa", "Imelda", "Inacayan", "Kaligutan", "Kapatagan", "Kidawa", "Kilagding", "Kiokmay", "Laac", "Langtud", "Longanapan", "Mabuhay", "Macopa", "Malinao", "Mangloy", "Melale", "Naga", "New Bethlehem", "Panamoren", "Sabud", "San Antonio", "Santa Emilia", "Santo Niño", "Sisimon"],
            "Mabini": ["Anitapan", "Cabuyoan", "Cadunan", "Candinuyan", "Cuambog", "Del Pilar", "Golden Valley", "Libudon", "Mambatang", "Manasa", "Mascareg", "Pangibiran", "Pindasan", "San Antonio", "Singapore", "Tagnanan"],
            "Maco": ["Anibongan", "Anislagan", "Binuangan", "Bucana", "Calabcab", "Concepcion", "Dumlan", "Elizalde", "Gubatan", "Hijo", "Kinuban", "Langgam", "Lapu-lapu", "Libay-libay", "Limbo", "Lumatab", "Magangit", "Mainit", "Malamodao", "Manipongol", "Mapaang", "Masara", "New Asturias", "New Barili", "New Leyte", "New Visayas", "Panangan", "Pangi", "Panibasan", "Sangab", "Tagbaros", "Taglawig", "Teresa", "Tinuingan", "Tubo-tubo", "Ulas", "V. Elizalde"],
            "Maragusan": ["Bagong Silang", "Bahi", "Cambagang", "Coronobe", "Katipunan", "Lahi", "Langgawisan", "Mabugnao", "Magcagong", "Mahayahay", "Mapawa", "Maragusan (Poblacion)", "Mauswagon", "New Albay", "New Katipunan", "New Manay", "New Panay", "Paloc", "Pamintaran", "Parasanon", "Talian", "Tandik", "Tigbao", "Tupas"],
            "Mawab": ["Andili", "Bawani", "Concepcion", "Malinawon", "Nueva Visayas", "Nuevo Iloco", "Poblacion", "Salvacion", "Saosao", "Sawangan", "Tuboran"],
            "Monkayo": ["Awao", "Babag", "Banlag", "Baylo", "Casoon", "Haguimitan", "Inambatan", "Macopa", "Mamunga", "Mount Diwata", "Naboc", "Olaycon", "Pasian", "Poblacion", "Rizal", "Salvacion", "San Isidro", "San Jose", "Tubo-tubo", "Union", "Upper Ulip"],
            "Montevista": ["Banagbanag", "Banglasan", "Bankerohan Norte", "Bankerohan Sur", "Camansi", "Camantangan", "Canidkid", "Concepcion", "Dauman", "Lebanon", "Linoan", "Mayaon", "New Calape", "New Cebulan", "New Dalaguete", "New Visayas", "Prosperidad", "San Jose", "San Vicente", "Tapia"],
            "New Bataan": ["Andap", "Bantacan", "Batinao", "Cabinuangan", "Camanlangan", "Cogonon", "Fatima", "Kahayag", "Katipunan", "Magangit", "Magsaysay", "Manurigao", "Pagsabangan", "Panag", "San Roque", "Tandawan"],
            "Pantukan": ["Araibo", "Bongabong", "Bongbong", "Jp Laurel", "Kingking", "Las Arenas", "Magnaga", "Matiao", "Napnapan", "P. Fuentes", "Tag-ugpo", "Tagdangua", "Tambongon", "Tibagon"]
        },
        "Davao Oriental": {
            "Mati City": ["Badas", "Bobon", "Buso", "Central", "Dahican", "Danao", "Don Enrique Lopez", "Don Martin Marundan", "Langka", "Lawigan", "Libudon", "Lupon", "Matiao", "Mayo", "Sainz", "Taguibo", "Tagum"],
            "Baganga": ["Baculin", "Banao", "Batawan", "Batiano", "Binondo", "Bobonao", "Campawan", "Central", "Dapnan", "Kinablangan", "Lambajon", "Lucod", "Mahanub", "Mikit", "Salingcomot", "San Isidro", "San Victor", "Saoquegue"],
            "Banaybanay": ["Cabangcalan", "Caganganan", "Calubihan", "Causwagan", "Mahayag", "Maputi", "Mogbongcogon", "Panikian", "Pintatagan", "Piso Proper", "Poblacion", "Punta Linao", "Rang-ay", "San Vicente"],
            "Boston": ["Caatihan", "Cabasagan", "Carmen", "Cawayanan", "Poblacion", "San Jose", "Sibajay", "Simulao"],
            "Caraga": ["Alvar", "Caningag", "Don Leon Balante", "Lamiawan", "Manorigao", "Mercedes", "Palma Gil", "Pichon", "Poblacion", "San Antonio", "San Jose", "San Luis", "San Miguel", "San Pedro", "Santa Fe", "Santiago", "Sobrecarey"],
            "Cateel": ["Abijod", "Alegria", "Aliwagwag", "Aragon", "Baybay", "Maglahus", "Mainit", "Malibago", "Poblacion", "San Alfonso", "San Antonio", "San Miguel", "San Rafael", "San Vicente", "Santa Filomena", "Taytayan"],
            "Governor Generoso": ["Anitap", "Crispin Dela Cruz", "Don Aurelio Chicote", "Lavigan", "Luzon", "Magdug", "Manuel Roxas", "Monserrat", "Nangan", "Oregon", "Poblacion", "Pundaguitan", "Sergio Osmeña", "Surop", "Tagabebe", "Tamban", "Tandang Sora", "Tibanban", "Tiblawan", "Upper Tibanban"],
            "Lupon": ["Bagumbayan", "Cabadiangan", "Calapagan", "Cocornon", "Corporacion", "Don Mariano Marcos", "Ilangay", "Langka", "Lantawan", "Limbahan", "Macangao", "Magsaysay", "Mahayahay", "Maragatas", "Marayag", "New Visayas", "Poblacion", "San Isidro", "San Jose", "Tagboa", "Tagugpo"],
            "Manay": ["Central", "Cayawan", "Concepcion", "Del Pilar", "Guza", "Holy Cross", "Lambog", "Mabini", "Manreza", "New Taokanga", "Old Macopa", "Rizal", "San Fermin", "San Ignacio", "San Isidro", "Zaragosa"],
            "Tarragona": ["Cabagayan", "Central", "Dadong", "Jovellar", "Limot", "Lucatan", "Maganda", "Ompao", "Tomoaong", "Tubaon"],
            "San Isidro": ["Baon"]
        },
        "Davao Occidental": {
            "Malita": ["Bolitoc", "Bolontoy", "Culaman", "Dapitan", "Don Narciso Ramos", "Happy Valley", "Kiokong", "Lawa-an", "Little Baguio", "Poblacion", "Sarmiento"],
            "Don Marcelino": ["Balasinon", "Dulian", "Kinanga", "New Katipunan", "Poblacion", "San Miguel", "Santa Rosa"],
            "Jose Abad Santos": ["Balangonan", "Buguis", "Bukid", "Butuan", "Butulan", "Caburan Big", "Caburan Small", "Camalian", "Carahayan", "Cayaponga", "Culaman", "Kalbay", "Kitayo", "Magulibas", "Malalan", "Mangile", "Marabutuan", "Meybio", "Molmol", "Nuing", "Patulang", "Quiapo", "San Isidro", "Sugal", "Tabayon", "Tanuman"],
            "Santa Maria": ["Basiawan", "Buca", "Cadaatan", "Datu Daligasao", "Datu Intan", "Kidadan", "Kinilidan", "Kisulad", "Malalag Tubig", "Mamacao", "Ogpao", "Poblacion", "Pongpong", "San Agustin", "San Antonio", "San Isidro", "San Juan", "San Pedro", "San Roque", "Santo Niño", "Santo Rosario", "Tanglad"],
            "Cateel": ["Aragon"]
        },
        "Agusan del Sur": {
            "Bayugan City": ["Berseba", "Bucac", "Cagbas", "Calaitan", "Canayugan", "Charito", "Claro Cortez", "Fili", "Gamao", "Getsemane", "Grace Estate", "Hamogaway", "Katipunan", "Mabuhay", "Magkiangkang", "Mahayag", "Marcelina", "Maygatasan", "Montivesta", "Mt. Ararat", "Mt. Carmel", "Mt. Olive", "New Salem", "Noli", "Osmeña", "Panaytay", "Pinagalaan", "Poblacion", "Sagmone", "Saguma", "Salvacion", "San Agustin", "San Isidro", "San Juan", "Santa Irene", "Santa Teresita", "Santo Niño", "Taglatawan", "Taglibas", "Tagubay", "Verdu", "Villa Undayon", "Wawa"],
            "Bunawan": ["Bunawan Brook", "Consuelo", "Imelda", "Libertad", "Mambalili", "Nueva Era", "Poblacion", "San Andres", "San Marcos", "San Teodoro"],
            "Esperanza": ["Bakingking", "Balubo", "Bentahon", "Bunaguit", "Catmonon", "Concordia", "Dakutan", "Duangan", "Guadalupe", "Guibon", "Hawilian", "Labao", "Maasin", "Mac-Arthur", "Mahagcot", "Maliwanag", "Milagros", "Nato", "New Gingoog", "Odiong", "Oro", "Piglawigan", "Poblacion", "Remedios", "Salug", "San Isidro", "San Jose", "San Toribio", "San Vicente", "Santa Fe", "Segunda", "Sinakungan", "Tagabase", "Taganahaw", "Tagbalili", "Tahina", "Tandang Sora", "Valentina"],
            "La Paz": ["Angeles", "Bataan", "Comota", "Halapitan", "Kasapa II", "Langasian", "Lydia", "Osmeña, Sr.", "Panagangan", "Poblacion", "Sabang Adgawan", "Sagunto", "San Patricio", "Valentina", "Villa Paz"],
            "Loreto": ["Binucayan", "Johnson", "Kasapa", "Katipunan", "Kauswagan", "Magaud", "Nueva Gracia", "Poblacion", "Sabud", "San Isidro", "San Mariano", "San Vicente", "Santa Teresa", "Santo Tomas", "Violanta", "Waloe"],
            "Prosperidad": ["Aurora", "Awa", "Azpetia", "La Caridad", "La Perian", "La Purisima", "La Suerte", "La Union", "Las Navas", "Libertad", "Los Arcos", "Lucena", "Mabuhay", "Magsaysay", "Mapaga", "Napo", "New Maug", "Patin-ay", "Poblacion", "Salimbogaon", "Salvacion", "San Joaquin", "San Jose", "San Lorenzo", "San Martin", "San Pedro", "San Rafael", "San Roque", "San Salvador", "San Vicente", "Santa Irene", "Santa Maria"],
            "Rosario": ["Bayugan 3", "Cabantao", "Libuac", "Maligaya", "Marfil", "Novele", "Poblacion", "Santa Cruz", "Tagbayagan", "Wasi-an"],
            "Sibagat": ["Afga", "Anahawan", "Banagbanag", "Del Rosario", "El Rio", "Ilihan", "Kioya", "Magkalape", "Magsaysay", "Mahayahay", "New Tubigon", "Padiay", "Perez", "Poblacion", "San Isidro", "San Vicente", "Santa Cruz", "Santa Maria", "Sinai", "Tabon-tabon", "Tag-uyango", "Villangit"],
            "Trento": ["Basa", "Cebolin", "Cuevas", "Kapatungan", "Langkila-an", "Manat", "New Visayas", "Pangyan", "Poblacion", "Pulang-lupa", "Salvacion", "San Ignacio", "San Isidro", "San Roque", "Santa Maria", "Tudela"],
            "San Francisco": [],
            "San Luis": [],
            "Santa Josefa": [],
            "Talacogon": [],
            "Veruela": [],
            "Butuan City": ["Sibagat"]
        },
        "Surigao del Sur": {
            "Bislig City": ["Bucto", "Burboanan", "Caguyao", "Coleto", "Comawas", "Kahayag", "Labisma", "Lawigan", "Maharlika", "Mangagoy", "Mone", "Pamanlinan", "Pamaypayan", "Poblacion", "San Antonio", "San Fernando", "San Isidro", "San Jose", "San Roque", "San Vicente", "Santa Cruz", "Sibaroy", "Tabon", "Tumanan"],
            "Tandag City": ["Awasian", "Bagong Lungsod", "Bioto", "Bongtod Poblacion", "Buenavista", "Dagocdoc", "Mabua", "Mabuhay", "Maitum", "Maticdum", "Pandanon", "Pangi", "Quezon", "Rosario", "Salvacion", "San Agustin Norte", "San Agustin Sur", "San Antonio", "San Isidro", "San Jose", "Telaje"],
            "Barobo": ["Amaga", "Bahi", "Cabacungan", "Cambagang", "Causwagan", "Dapdap", "Dughan", "Gamut", "Javier", "Kinayan", "Mamis", "Poblacion", "Rizal", "San Jose", "San Roque", "San Vicente", "Sua", "Sudlon", "Tambis", "Unidad", "Wakat"],
            "Bayabas": ["Amag", "Balete", "Cabugo", "Cagbaoto", "La Paz", "Magobawok", "Panaosawon"],
            "Cagwait": ["Aras-asan", "Bacolod", "Bitaugan East", "Bitaugan West", "La Purisima", "Lactudan", "Mat-e", "Poblacion", "Tawagan", "Tubo-tubo", "Unidad", "Baguhin"],
            "Cantilan": ["Bugsukan", "Buntalid", "Cabangahan", "Cabas-an", "Calagdaan", "Consuelo", "General Island", "Lininti-an", "Lobo", "Magasang", "Magosilom", "Pag-antayan", "Palasao", "Parang", "San Pedro", "Tapi", "Tigabong"],
            "Carrascal": ["Adlay", "Babuyan", "Bacolod", "Baybay", "Bon-ot", "Caglayag", "Dahican", "Doyos", "Embarcadero", "Gamuton", "Panikian", "Pantukan", "Saca", "Tag-Anito"],
            "Cortes": ["Balibadon", "Burgos", "Capandan", "Mabahin", "Madrelino", "Manlico", "Matho", "Poblacion", "Tag-Anito", "Tigao", "Tuboran", "Uba"],
            "Hinatuan": ["Baculin", "Benigno Aquino (Zone I)", "Bigaan", "Bitoon", "Cambatong", "Campa", "Dugmanon", "Harip", "La Casa (Poblacion)", "Loyola", "Maharlika (Zone III)", "Maligaya", "Pocto", "Port Lamon", "Roxas", "San Juan", "Santo Niño (Zone II)", "Sasa", "Tagasaka", "Tagbobonga", "Talisay", "Tarusan", "Tidman", "Tiwi"],
            "Carmen": [],
            "Lanuza": [],
            "Lianga": ["Ganayon"],
            "Lingig": [],
            "Madrid": [],
            "Marihatag": [],
            "San Agustin": [],
            "San Miguel": [],
            "Tagbina": [],
            "Tago": [],
            "Gigaquit": ["Banza"],
            "Asuncion": ["Buan"]
        },
        "Bukidnon": {
            "Malaybalay City": ["Apo Macote", "Barangay 1", "Barangay 2", "Barangay 3", "Barangay 4", "Barangay 5", "Barangay 6", "Barangay 7", "Barangay 8", "Barangay 9", "Barangay 10", "Barangay 11", "Busdi", "Cabangahan", "Caburacanan", "Canayan", "Capitan Angel", "Casisang", "Dalwangan", "Imbayao", "Indalaza", "Kabalabag", "Kalasungay", "Kulaman", "Linabo", "Maligaya", "Managok", "Manalog", "Mapayag", "Mapulo", "Miglamin", "Patpat", "Saint Peter", "San Jose", "San Martin", "Santo Niño", "Silae", "Simaya", "Sinanglanan", "Sumpong", "Violeta", "Zamboanguita"],
            "Valencia City": ["Bagontaas", "Banlag", "Barobo", "Batangan", "Catumbalon", "Colonia", "Concepcion", "Dagat-Kidavao", "Guinoyuran", "Kahapunan", "Laligan", "Lilingayon", "Lourdes", "Lumbayao", "Lumbo", "Lurogan", "Maapag", "Mabuhay", "Mailag", "Mt. Nebo", "Nabago", "Pinatilan", "Poblacion", "San Carlos", "San Isidro", "Sinabuagan", "Sinayawan", "Sugod", "Tongantongan", "Tugaya", "Vintar"],
            "Baungon": ["Balintad", "Buenavista", "Danatag", "Imbatug", "Kalilangan", "Lacolac", "Langaon", "Liboran", "Lingating", "Mabuhay", "Mabunga", "Nicdao", "Pualas", "Salimbalan", "San Miguel", "San Vicente"],
            "Cabanglasan": ["Anlogan", "Cabulohan", "Canangaan", "Capinonan", "Dalacutan", "Freedom", "Iba", "Imbatug", "Lambangan", "Mandaing", "Mandahican", "Mauswagon", "Paradise", "Poblacion", "Togop"],
            "Damulog": ["Alikaraw", "Angga-an", "Kinapat", "Kiraon", "Kitingting", "Lagandang", "Macapari", "Maican", "Migcawayan", "New Compostela", "Old Damulog", "Omonay", "Poblacion", "Pocopoco", "Sampagar", "San Isidro", "Tangkulan"],
            "Dangcagan": ["Barongcot", "Bugwak", "Dolorosa", "Kapalaran", "Kianggat", "Lourdes", "Maclo", "Miaray", "Migcuya", "New Visayas", "Osmeña", "Poblacion", "Sagbayan", "San Vicente", "Santo Niño", "Yapungco"],
            "Don Carlos": ["Bismartz", "Bocboc", "Buyot", "Cabadiangan", "Calao-calao", "Don Carlos Norte", "Don Carlos Sur", "Embayao", "Kalubihon", "Kasigkot", "Kawilihan", "Kibatang", "Kiorao", "Kipling", "Mahayahay", "Manlamonay", "Maraymaray", "Mauswagon", "Minsalagan", "New Nongnongan", "New Visayas", "Old Nongnongan", "Pinamaloy", "Pualas", "San Antonio East", "San Antonio West", "San Francisco", "San Nicolas", "San Roque", "Sinangguyan"],
            "Impasugong": ["Bontongon", "Bulonay", "Capitan Bayong", "Cawayan", "Dumalaguing", "Guihean", "Hagpa", "Impalutao", "Kalabugao", "Kibenton", "La Fortuna", "Poblacion", "San Vicente"],
            "Maramag": ["Anahawon", "Bagong Silang", "Base Camp", "Bayabason", "Camp 1", "Colambugon", "Dagumba-an", "Danggawan", "Dologon", "Kisanday", "Kuya", "La Roxas", "North Poblacion", "Panadtalan", "Panalsalan", "San Miguel", "San Roque", "South Poblacion", "Tubigon", "Tubog"],
            "Malabalay City": ["Busdi", "San Fernando"],
        },
        "Compostela Valley": {
            "Nabunturan": ["Anislagan", "Antequera", "Basak", "Bucal", "Cabidianan", "Katipunan", "Magading", "Magsaysay", "Nabunturan", "Pandasan", "Poblacion", "San Vicente"],
            "Mabini": ["Anitapan", "Cabuyoan", "Cadunan", "Candinuyan", "Cuambog", "Del Pilar", "Golden Valley", "Libudon", "Mambatang", "Manasa", "Mascareg", "Pangibiran", "Pindasan", "San Antonio", "Singapore", "Tagnanan"],
            "Montevista": ["Banagbanag", "Banglasan", "Bankerohan Norte", "Bankerohan Sur", "Camansi", "Camantangan", "Canidkid", "Concepcion", "Dauman", "Lebanon", "Linoan", "Mayaon", "New Calape", "New Cebulan", "New Dalaguete", "New Visayas", "Prosperidad", "San Jose", "San Vicente", "Tapia"],
            "New Bataan": ["Andap", "Bantacan", "Batinao", "Cabinuangan", "Camanlangan", "Cogonon", "Fatima", "Kahayag", "Katipunan", "Magangit", "Magsaysay", "Manurigao", "Pagsabangan", "Panag", "San Roque", "Tandawan"],
            "Pantukan": ["Araibo", "Bongabong", "Bongbong", "Jp Laurel", "Kingking", "Las Arenas", "Magnaga", "Matiao", "Napnapan", "P. Fuentes", "Tag-ugpo", "Tagdangua", "Tambongon", "Tibagon"],
            "Laak": ["Aguinaldo", "Amor Cruz", "Ampawid", "Andap", "Anitap", "Adnap", "Bagong Silang", "Banbanon", "Belmonte", "Binasbas", "Bullucan", "Cebulida", "Concepcion", "Datu Ampunan", "Datu Davao", "Doña Josefa", "El Katipunan", "Il Papa", "Imelda", "Inacayan", "Kaligutan", "Kapatagan", "Kidawa", "Kilagding", "Kiokmay", "Laac", "Langtud", "Longanapan", "Mabuhay", "Macopa", "Malinao", "Mangloy", "Melale", "Naga", "New Bethlehem", "Panamoren", "Sabud", "San Antonio", "Santa Emilia", "Santo Niño", "Sisimon"],
            "Maco": ["Anibongan", "Anislagan", "Binuangan", "Bucana", "Calabcab", "Concepcion", "Dumlan", "Elizalde", "Gubatan", "Hijo", "Kinuban", "Langgam", "Lapu-lapu", "Libay-libay", "Limbo", "Lumatab", "Magangit", "Mainit", "Malamodao", "Manipongol", "Mapaang", "Masara", "New Asturias", "New Barili", "New Leyte", "New Visayas", "Panangan", "Pangi", "Panibasan", "Sangab", "Tagbaros", "Taglawig", "Teresa", "Tinuingan", "Tubo-tubo", "Ulas", "V. Elizalde"],
            "Maragusan": ["Bagong Silang", "Bahi", "Cambagang", "Coronobe", "Katipunan", "Lahi", "Langgawisan", "Mabugnao", "Magcagong", "Mahayahay", "Mapawa", "Maragusan (Poblacion)", "Mauswagon", "New Albay", "New Katipunan", "New Manay", "New Panay", "Paloc", "Pamintaran", "Parasanon", "Talian", "Tandik", "Tigbao", "Tupas"],
            "Mawab": ["Andili", "Bawani", "Concepcion", "Malinawon", "Nueva Visayas", "Nuevo Iloco", "Poblacion", "Salvacion", "Saosao", "Sawangan", "Tuboran"],
            "Monkayo": ["Awao", "Babag", "Banlag", "Baylo", "Casoon", "Haguimitan", "Inambatan", "Macopa", "Mamunga", "Mount Diwata", "Naboc", "Olaycon", "Pasian", "Poblacion", "Rizal", "Salvacion", "San Isidro", "San Jose", "Tubo-tubo", "Union", "Upper Ulip"],
            "Compostela": ["Bagongsilang", "Gabi", "Lagab", "Mangayon", "Mapaca", "Ngan", "New Leyte", "New Panay", "Osmeña", "Poblacion", "Siocon"]
        },
        "Cotabato": {
            "Kidapawan": ["Amas", "Amazion", "Balabag", "Balindog", "Binoligan", "Birada", "Gayola", "Ginatilan", "Ilomavis", "Indangan", "Junction", "Kalaisan", "Kalasuyan", "Katipunan", "Lanao", "Linangcob", "Luvimin", "Macebolig", "Magsaysay", "Malinan", "Manongol", "Marbel", "Meohao", "Mua-an", "New Bohol", "Nuangan", "Onica", "Paco", "Patadon", "Perez", "Poblacion", "San Isidro", "San Roque", "Saniel", "Santo Niño", "Sibawan", "Sikitan", "Singao", "Sudapin", "Sumbac"],
            "Kidapawan City": ["Amas", "Amazion", "Balabag", "Balindog", "Binoligan", "Birada", "Gayola", "Ginatilan", "Ilomavis", "Indangan", "Junction", "Kalaisan", "Kalasuyan", "Katipunan", "Lanao", "Linangcob", "Luvimin", "Macebolig", "Magsaysay", "Malinan", "Manongol", "Marbel", "Meohao", "Mua-an", "New Bohol", "Nuangan", "Onica", "Paco", "Patadon", "Perez", "Poblacion", "San Isidro", "San Roque", "Saniel", "Santo Niño", "Sibawan", "Sikitan", "Singao", "Sudapin", "Sumbac"],
            "North Cotabato": ["Balogo"],
            "Antipas": ["B. Cadungon", "Camutan", "Canaan", "Datag", "Datu Agod", "Datu Selio", "Dolores", "Kiyab", "Luhong", "Magsaysay", "Malatab", "Malire", "New Pontevedra", "Poblacion"],
            "M'lang": ["Bagontapay", "Bialong", "Buayan", "Calunasan", "Dalipe", "Dugong", "Dungo-an", "Gaunan", "Inas", "Katipunan", "La Fortuna", "Lepaga", "Libo-o", "Lika", "Luz Village", "Magallon", "Malayan", "New Antique", "New Barbaza", "New Kalibo", "New Lawaan", "New Rizal", "Nueva Vida", "Pag-asa", "Palma-Perez", "Poblacion A", "Poblacion B", "Pulang-lupa", "Sangat", "Tawantawan", "Tibao", "Ugalingan"],
            "Makilala": ["Batasan", "Bato", "Biangan", "Buenavida", "Buhay", "Bulatukan", "Cabilao", "Concepcion", "Dagupan", "Garsika", "Guabong", "Indangan", "Jose Rizal", "Katipunan", "Kisante", "Lebce", "Libertad", "Luayon", "Luna Norte", "Luna Sur", "Malabuan", "Malasila", "Malungon", "New Baguio", "New Bulatukan", "New Cebu", "New Israel", "New Pikit", "Old Bulatukan", "Poblacion", "Rodero", "Saguing", "San Vicente", "Santa Felomina", "Santo Niño", "Sinkatulan", "Taluntalunan", "Villaflores"],
            "Magpet": ["Alibayon", "Bagumbayan", "Balite", "Bantac", "Basak", "Binay", "Bituan", "Bongolanon", "Datu Celo", "Datu Inkal", "Del Pilar", "Doles", "Don Panaca", "Gubatan", "Ilian", "Imamaling", "Inac", "Kamada", "Kauswagan", "Kinarum", "Kisupaan", "Magcaalam", "Mahongcog", "Manobisa", "Manobo", "Noa", "Owas", "Pangao-an", "Poblacion", "Sallab", "Tagbak", "Temporan", "Timbujon", "Tumanding", "Yapongco"],
            "Tulunan": ["Bacong", "Banayal", "Batang", "Bituan", "Bual", "Bunawan", "Daig", "Damawato", "Dungos", "Galidan", "Genoveva Baynosa", "Kanebong", "Kanibong", "La Esperanza", "Lampagang", "Magbok", "Maybula", "Minapan", "Nabundasan", "New Caridad", "New Culasi", "New Panay", "Paraiso", "Poblacion", "Popoyon", "Sibsib", "Tambac", "Tuburan"],
            "Pigcawayan": ["Anick", "Balacayon", "Balogo", "Banucagon", "Bulucaon", "Buluan", "Buricain", "Capayuran", "Datu Binasing", "Datu Mantil", "Kadingilan", "Kimarayag", "Libungan Torreta", "Maluao", "Manaulanan", "Matilac", "Midpapan I", "Midpapan II", "Mulok", "New Culasi", "New Igbaras", "New Panay", "North Manuangan", "Poblacion I", "Poblacion II", "Poblacion III", "Presbitero", "Renibon", "Simsiman", "South Manuangan", "Tigbawan", "Tubon", "Upper Baguer"],
            "Pigkawayan": ["Anick", "Balacayon", "Balogo", "Banucagon", "Bulucaon", "Buluan", "Buricain", "Capayuran", "Datu Binasing", "Datu Mantil", "Kadingilan", "Kimarayag", "Libungan Torreta", "Maluao", "Manaulanan", "Matilac", "Midpapan I", "Midpapan II", "Mulok", "New Culasi", "New Igbaras", "New Panay", "North Manuangan", "Poblacion I", "Poblacion II", "Poblacion III", "Presbitero", "Renibon", "Simsiman", "South Manuangan", "Tigbawan", "Tubon", "Upper Baguer"],
            "Pikit": ["Bagoinged", "Balabak", "Balatican", "Balong", "Balungis", "Barungis", "Batulawan", "Bualan", "Buliok", "Bulod", "Bulol", "Calawag", "Dalingaoen", "Damalasak", "Fort Pikit", "Ginatilan", "Gligli", "Gokoton", "Inug-ug", "Kabasalan", "Kalacacan", "Katilacan", "Kolambog", "Ladtingan", "Lagunde", "Langayen", "Macabuan", "Macasendeg", "Manaulanan", "Nabundas", "Nalapaan", "Nunguan", "Paidu Pulangi", "Pamalian", "Panicupan", "Poblacion", "Punol", "Rajah Muda", "Silik", "Takepan", "Talitay", "Tinutulan"],
            "President Roxas": [],
            "Arakan": [],
            "Banisilan": [],
            "Carmen": [],
            "Kabacan": [],
            "Libungan": [],
            "Matalam": [],
            "Aleosan": []
        }
    }
};

export const getCitiesForProvince = (province?: string): string[] => {
    if (!province) return [];
    return locationData.cities[province] ?? [];
};

export const getCitiesForProvinceWithBarangays = (province?: string): string[] => {
    if (!province) return [];
    const cities = locationData.cities[province] ?? [];
    const barangaysByCity = locationData.barangays[province] ?? {};
    return cities.filter((city) => (barangaysByCity[city]?.length ?? 0) > 0);
};

export const getBarangaysForCity = (province?: string, city?: string): string[] => {
    if (!province || !city) return [];
    return locationData.barangays[province]?.[city] ?? [];
};
