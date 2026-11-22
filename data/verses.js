// Koleksi Ayat Emas Alkitab Indonesia (TB - Terjemahan Baru)
const BIBLE_VERSES = [
  {
    passage: "Filipi 4:6-7",
    text: "Janganlah hendaknya kamu kuatir tentang apa pun juga, tetapi nyatakanlah dalam segala hal keinginanmu kepada Allah dalam doa dan permohonan dengan ucapan syukur. Damai sejahtera Allah, yang melampaui segala akal, akan memelihara hati dan pikiranmu dalam Kristus Yesus.",
    theme: "Damai Sejahtera & Doa",
    reflectionPrompt: "Kekhawatiran apa yang ingin kuserahkan ke dalam tangan Tuhan hari ini?"
  },
  {
    passage: "Yeremia 29:11",
    text: "Sebab Aku ini mengetahui rancangan-rancangan apa yang ada pada-Ku mengenai kamu, demikianlah firman TUHAN, yaitu rancangan damai sejahtera dan bukan rancangan kecelakaan, untuk memberikan kepadamu hari depan yang penuh harapan.",
    theme: "Pengharapan & Masa Depan",
    reflectionPrompt: "Apakah aku mempercayai bahwa rancangan Tuhan bagiku selalu mendatangkan kebaikan?"
  },
  {
    passage: "Amsal 3:5-6",
    text: "Percayalah kepada TUHAN dengan segenap hatimu, dan janganlah bersandar kepada pengertianmu sendiri. Akuilah Dia dalam segala lakumu, maka Ia akan meluruskan jalanmu.",
    theme: "Kepercayaan & Hikmat",
    reflectionPrompt: "Di area hidup mana aku masih sering mengandalkan kekuatanku sendiri?"
  },
  {
    passage: "Mazmur 23:1-3",
    text: "TUHAN adalah gembalaku, takkan kekurangan aku. Ia membaringkan aku di padang yang berumput hijau, Ia membimbing aku ke air yang tenang; Ia menyegarkan jiwaku. Ia menuntun aku di jalan yang benar oleh karena nama-Nya.",
    theme: "Penyertaan Tuhan",
    reflectionPrompt: "Bagaimana Tuhan telah menyegarkan dan memulihkan jiwaku minggu ini?"
  },
  {
    passage: "Yesaya 40:29 & 31",
    text: "Dia memberi kekuatan kepada yang lelah dan menambah semangat kepada yang tiada berdaya... tetapi orang-orang yang menanti-nantikan TUHAN mendapat kekuatan baru: mereka seumpama rajawali yang naik terbang dengan kekuatan sayapnya; mereka berlari dan tidak menjadi lesu, mereka berjalan dan tidak menjadi lelah.",
    theme: "Kekuatan Baru",
    reflectionPrompt: "Apakah aku sedang merasa lelah? Sudahkah aku datang menanti-nantikan Tuhan dalam doa?"
  },
  {
    passage: "Matius 11:28",
    text: "Marilah kepada-Ku, semua yang letih lesu dan berbeban berat, Aku akan memberi kelegaan kepadamu.",
    theme: "Kelegaan Sejati",
    reflectionPrompt: "Beban apa yang menekan hatiku dan perlu kuletakkan di kaki salib Yesus?"
  },
  {
    passage: "Roma 8:28",
    text: "Kita tahu sekarang, bahwa Allah turut bekerja dalam segala sesuatu untuk mendatangkan kebaikan bagi mereka yang mengasihi Dia, yaitu bagi mereka yang terpanggil sesuai dengan rencana Allah.",
    theme: "Kedaulatan Allah",
    reflectionPrompt: "Bagaimana aku memandang kesulitan saat ini dalam terang kebaikan rencana Allah?"
  },
  {
    passage: "Mazmur 46:1-2",
    text: "Allah bagi kita adalah tempat perlindungan dan kekuatan, sebagai penolong dalam kesesakan sangat terbukti. Sebab itu kita tidak akan takut, sekalipun bumi berubah, sekalipun gunung-gunung goncang di dalam laut.",
    theme: "Perlindungan & Keteguhan",
    reflectionPrompt: "Ketika badai hidup datang, siapakah tempat perlindungan utamaku?"
  },
  {
    passage: "Yohanes 14:27",
    text: "Damai sejahtera Kutinggalkan bagimu. Damai sejahtera-Ku Kuberikan kepadamu, dan apa yang Kuberikan tidak seperti yang diberikan oleh dunia kepadamu. Janganlah gelisah dan gentar hatimu.",
    theme: "Damai Kristus",
    reflectionPrompt: "Apakah damai Kristus telah meredakan kegelisahan dalam batinku?"
  },
  {
    passage: "Mazmur 121:1-2",
    text: "Aku melayangkan mataku ke gunung-gunung; dari manakah akan datang pertolonganku? Pertolonganku ialah dari TUHAN, yang menjadikan langit dan bumi.",
    theme: "Sumber Pertolongan",
    reflectionPrompt: "Ke mana pandanganku tertuju hari ini: pada masalah, atau pada Sang Pencipta?"
  },
  {
    passage: "Yesaya 41:10",
    text: "Janganlah takut, sebab Aku menyertai engkau, janganlah bimbang, sebab Aku ini Allahmu; Aku akan meneguhkan, bahkan akan menolong engkau; Aku akan memegang engkau dengan tangan kanan-Ku yang membawa kemenangan.",
    theme: "Kemenangan dalam Iman",
    reflectionPrompt: "Janji penyertaan Tuhan mana yang paling meneguhkan langkahku hari ini?"
  },
  {
    passage: "Ratapan 3:22-23",
    text: "Tak berkesudahan kasih setia TUHAN, tak habis-habisnya rahmat-Nya, selalu baru tiap pagi; besar kesetiaan-Mu!",
    theme: "Kasih Setia Tuhan",
    reflectionPrompt: "Rahmat baru apa yang kualami ketika membuka mata di pagi hari ini?"
  },
  {
    passage: "Mazmur 119:105",
    text: "Firman-Mu itu pelita bagi kakiku dan terang bagi jalanku.",
    theme: "Panduan Firman",
    reflectionPrompt: "Apakah firman Tuhan yang menjadi pedoman dalam keputusan-keputusan kecilku hari ini?"
  },
  {
    passage: "Yosua 1:9",
    text: "Bukankah telah Kuperintahkan kepadamu: kuatkan dan teguhkanlah hatimu? Janganlah kecut dan tawar hati, sebab TUHAN, Allahmu, menyertai engkau, ke mana pun engkau pergi.",
    theme: "Keberanian Rohani",
    reflectionPrompt: "Tantangan baru apa yang membutuhkan keberanian berlandaskan firman Tuhan?"
  },
  {
    passage: "Galatia 5:22-23",
    text: "Tetapi buah Roh ialah: kasih, sukacita, damai sejahtera, kesabaran, kemurahan, kebaikan, kesetiaan, kelemahlembutan, penguasaan diri. Tidak ada hukum yang menentang hal-hal itu.",
    theme: "Buah Roh",
    reflectionPrompt: "Buah Roh manakah yang paling perlu kutumbuhkan dalam interaksiku hari ini?"
  },
  {
    passage: "Efesus 2:8-10",
    text: "Sebab karena kasih karunia kamu diselamatkan oleh iman; itu bukan hasil usahamu, tetapi pemberian Allah... Karena kita ini buatan Allah, diciptakan dalam Kristus Yesus untuk melakukan pekerjaan baik.",
    theme: "Kasih Karunia",
    reflectionPrompt: "Pekerjaan baik apa yang Tuhan siapkan bagiku untuk dikerjakan hari ini?"
  },
  {
    passage: "Mazmur 91:1-2",
    text: "Orang yang duduk dalam lindungan Yang Mahatinggi dan bermalam dalam naungan Yang Mahakuasa akan berkata kepada TUHAN: 'Tempat perlindunganku dan kubu pertahananku, Allahku, pada-Mu aku percaya.'",
    theme: "Naungan Ilahi",
    reflectionPrompt: "Apakah aku meluangkan waktu berdiam dalam naungan hadirat-Nya?"
  },
  {
    passage: "Kolose 3:12-14",
    text: "Kenakanlah belas kasihan, kemurahan, kerendahan hati, kelemahlembutan dan kesabaran. Sabarlah kamu seorang terhadap yang lain, dan ampunilah seorang akan yang lain... Dan di atas semuanya itu: kenakanlah kasih, sebagai pengikat yang mempersatukan dan menyempurnakan.",
    theme: "Kasih & Pengampunan",
    reflectionPrompt: "Adakah seseorang yang perlu kuampuni atau kulayani dengan kelemahlembutan?"
  },
  {
    passage: "Mazmur 37:4-5",
    text: "Dan bergembiralah karena TUHAN; maka Ia akan memberikan kepadamu apa yang diinginkan hatimu. Serahkanlah hidupmu kepada TUHAN dan percayalah kepada-Nya, dan Ia akan bertindak.",
    theme: "Menyerahkan Jalan Hidup",
    reflectionPrompt: "Apakah sukacitaku bersumber dari hal-hal materi atau dari hubungan dengan Tuhan?"
  },
  {
    passage: "2 Korintus 12:9",
    text: "Tetapi jawab TUHAN kepadaku: 'Cukuplah kasih karunia-Ku bagimu, sebab justru dalam kelemahanlah kuasa-Ku menjadi sempurna.' Sebab itu terlebih suka aku bermegah atas kelemahanku, supaya kuasa Kristus turun menaungi aku.",
    theme: "Kelemahan & Kuasa Allah",
    reflectionPrompt: "Di mana aku merasa lemah, sehingga kuasa Kristus dapat dinyatakan secara sempurna?"
  },
  {
    passage: "1 Tesalonika 5:16-18",
    text: "Bersukacitalah senantiasa. Tetaplah berdoa. Mengucap syukurlah dalam segala hal, sebab itulah yang dikehendaki Allah di dalam Kristus Yesus bagi kamu.",
    theme: "Ucapan Syukur",
    reflectionPrompt: "Tiga hal spesifik apa yang sangat kusyukuri kepada Tuhan hari ini?"
  },
  {
    passage: "Ibrani 11:1",
    text: "Iman adalah dasar dari segala sesuatu yang kita harapkan dan bukti dari segala sesuatu yang tidak kita lihat.",
    theme: "Dasar Iman",
    reflectionPrompt: "Bagaimana imanku memandang hal-hal yang belum terlihat dalam doaku?"
  },
  {
    passage: "Yohanes 15:5",
    text: "Akulah pokok anggur dan kamulah ranting-rantingnya. Barangsiapa tinggal di dalam Aku dan Aku di dalam dia, ia berbuah banyak, sebab di luar Aku kamu tidak dapat berbuat apa-apa.",
    theme: "Tinggal dalam Kristus",
    reflectionPrompt: "Bagaimana caraku tetap terkoneksi intim dengan Pokok Anggur sejati sepanjang hari ini?"
  },
  {
    passage: "Mazmur 103:1-2",
    text: "Pujilah TUHAN, hai jiwaku! Pujilah nama-Nya yang kudus, hai segenap batinku! Pujilah TUHAN, hai jiwaku, dan janganlah lupakan segala kebaikan-Nya!",
    theme: "Mengingat Kebaikan Tuhan",
    reflectionPrompt: "Pernahkah aku melupakan mujizat atau kebaikan Tuhan di masa lalu?"
  },
  {
    passage: "Roma 12:2",
    text: "Janganlah kamu menjadi serupa dengan dunia ini, tetapi berubahlah oleh pembaharuan budimu, sehingga kamu dapat membedakan manakah kehendak Allah: apa yang baik, yang berkenan kepada Allah dan yang sempurna.",
    theme: "Pembaruan Pikiran",
    reflectionPrompt: "Pola pikir duniawi apa yang perlu digantikan oleh kebenaran firman Allah?"
  },
  {
    passage: "1 Korintus 13:4 & 7",
    text: "Kasih itu sabar; kasih itu murah hati; ia tidak cemburu. Ia tidak memegahkan diri dan tidak sombong... Ia menutupi segala sesuatu, percaya segala sesuatu, mengharapkan segala sesuatu, menuntut segala sesuatu.",
    theme: "Hakikat Kasih",
    reflectionPrompt: "Bagaimana kasih Kristus dapat tercermin melalui kata-kataku kepada keluarga dan sesama?"
  },
  {
    passage: "Mazmur 34:18-19",
    text: "TUHAN itu dekat kepada orang-orang yang patah hati, dan Ia menyelamatkan orang-orang yang remuk jiwanya. Kemalangan orang benar banyak, tetapi TUHAN melepaskan dia dari semuanya itu.",
    theme: "Penghiburan bagi yang Terluka",
    reflectionPrompt: "Apakah hatiku sedang terluka? Ingatlah Tuhan sangat dekat memeluk jiwa yang remuk."
  },
  {
    passage: "Matius 6:33-34",
    text: "Tetapi carilah dahulu Kerajaan Allah dan kebenaran-Nya, maka semuanya itu akan ditambahkan kepadamu. Sebab itu janganlah kamu kuatir akan hari besok, karena hari besok mempunyai kesusahannya sendiri.",
    theme: "Prioritas Kerajaan Allah",
    reflectionPrompt: "Apakah Kerajaan Allah dan kebenaran-Nya telah menjadi prioritas nomor satu hari ini?"
  },
  {
    passage: "Yesaya 43:18-19",
    text: "Firman-Nya: 'Janganlah ingat-ingat hal-hal yang dahulu, dan janganlah perhatikan hal-hal yang dari zaman purbakala! Lihat, Aku hendak membuat sesuatu yang baru, yang sekarang sudah tumbuh, belumkah kamu mengetahuinya?'",
    theme: "Hal yang Baru",
    reflectionPrompt: "Masa lalu atau kegagalan apa yang perlu kurelakan agar dapat menyambut karya baru Tuhan?"
  },
  {
    passage: "Filipi 4:13",
    text: "Segala perkara dapat kutanggung di dalam Dia yang memberi kekuatan kepadaku.",
    theme: "Kekuatan Sejati",
    reflectionPrompt: "Apa rintangan yang kutakuti hari ini, dan bagaimana Kristus memampukanku melaluinya?"
  },
  {
    passage: "Yakobus 1:5",
    text: "Tetapi apabila di antara kamu ada yang kekurangan hikmat, hendaklah ia memintakannya kepada Allah, yang memberikan kepada semua orang dengan murah hati dan dengan tidak membangkit-bangkit, maka hal itu akan diberikan kepadanya.",
    theme: "Memohon Hikmat",
    reflectionPrompt: "Keputusan penting apa yang membutuhkan hikmat ilahi dari Tuhan hari ini?"
  }
];

// Helper: Ambil Ayat Hari Ini berdasarkan tanggal (hari ke berapa dalam tahun)
function getVerseOfTheDay(targetDate = new Date()) {
  const start = new Date(targetDate.getFullYear(), 0, 0);
  const diff = targetDate - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  const index = Math.abs(dayOfYear % BIBLE_VERSES.length);
  return {
    ...BIBLE_VERSES[index],
    dayOfYear,
    dateString: targetDate.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };
}
