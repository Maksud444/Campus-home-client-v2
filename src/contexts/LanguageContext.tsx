'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'en' | 'ar' | 'bn' | 'id' | 'uz' | 'ru' | 'fr' | 'kk' | 'ms'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.properties': 'Properties',
    'nav.services': 'Services',
    'nav.login': 'Login',
    'nav.getStarted': 'Get Started',
    'nav.dashboard': 'Dashboard',
    'nav.settings': 'Settings',
    'nav.createPost': 'Create Post',
    'nav.logout': 'Logout',

    // Hero Section
    'hero.title': 'Find Your Perfect Student Housing',
    'hero.subtitle': 'Search properties for rent, roommates, and shared apartments',
    'hero.location': 'Location',
    'hero.propertyType': 'Property Type',
    'hero.priceRange': 'Price Range',
    'hero.search': 'Search',
    'hero.apartment': 'Apartment',
    'hero.room': 'Room',
    'hero.roommate': 'Roommate',

    // Stats
    'stats.properties': 'Properties',
    'stats.students': 'Students',
    'stats.agents': 'Agents',
    'stats.satisfied': 'Satisfied Clients',

    // Properties Section
    'properties.featured': 'Featured Properties',
    'properties.viewAll': 'View All',
    'properties.bedrooms': 'Bedrooms',
    'properties.bathrooms': 'Bathrooms',
    'properties.area': 'Area',
    'properties.month': 'month',

    // Properties Page
    'propertiesPage.title': 'Browse Properties',
    'propertiesPage.subtitle': 'Find your perfect home in Egypt',
    'propertiesPage.filters': 'Filters',
    'propertiesPage.city': 'City',
    'propertiesPage.type': 'Type',
    'propertiesPage.minPrice': 'Min Price',
    'propertiesPage.maxPrice': 'Max Price',
    'propertiesPage.clearFilters': 'Clear Filters',
    'propertiesPage.found': 'Found',
    'propertiesPage.noProperties': 'No properties found',
    'propertiesPage.adjustFilters': 'Try adjusting your filters',
    'propertiesPage.viewDetails': 'View Details',
    'propertiesPage.whatsapp': 'WhatsApp',
    'propertiesPage.views': 'views',
    'propertiesPage.likes': 'likes',

    // Services
    'services.title': 'Home Services',
    'services.viewProviders': 'View Providers',

    // Post Page
    'post.title': 'Create Post',
    'post.subtitle': 'Find a roommate or room',
    'post.type': 'Post Type',
    'post.property': 'Property',
    'post.propertyDesc': 'List a property',
    'post.lookingRoommate': 'Looking for Roommate',
    'post.lookingRoommateDesc': 'Find someone to share',
    'post.lookingRoom': 'Looking for Room',
    'post.lookingRoomDesc': 'Find a place to stay',
    'post.titleLabel': 'Title',
    'post.description': 'Description',
    'post.descriptionPlaceholder': 'Describe your property or requirements...',

    // How It Works
    'howItWorks.whyTitle': 'Why Choose Us',
    'howItWorks.mainTitle': 'We care about your',
    'howItWorks.mainTitleHighlight': 'home search',
    'howItWorks.mainTitleEnd': 'experience',
    'howItWorks.verified': 'Verified Properties',
    'howItWorks.verifiedDesc': 'All properties are verified and inspected for your safety',
    'howItWorks.trusted': 'Trusted Landlords',
    'howItWorks.trustedDesc': 'Connect with verified and trusted property owners',
    'howItWorks.communication': 'Easy Communication',
    'howItWorks.communicationDesc': 'Direct messaging with property owners and quick responses',
    'howItWorks.secure': 'Secure Payments',
    'howItWorks.secureDesc': 'Safe and transparent rental agreements and transactions',
    'howItWorks.title': 'How it Works?',
    'howItWorks.subtitle': 'Follow these 4 simple steps to find and move into your perfect student home in Egypt.',
    'howItWorks.step1': 'Search',
    'howItWorks.step1Desc': 'Find properties near your university.',
    'howItWorks.step2': 'Details',
    'howItWorks.step2Desc': 'Check photos, amenities, and reviews.',
    'howItWorks.step3': 'Contact',
    'howItWorks.step3Desc': 'Message owners and schedule visits.',
    'howItWorks.step4': 'Move In',
    'howItWorks.step4Desc': 'Complete booking and get your keys.',
    'howItWorks.cta': 'Start Searching Now',
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.properties': 'العقارات',
    'nav.services': 'الخدمات',
    'nav.login': 'تسجيل الدخول',
    'nav.getStarted': 'ابدأ',
    'nav.dashboard': 'لوحة التحكم',
    'nav.settings': 'الإعدادات',
    'nav.createPost': 'إنشاء منشور',
    'nav.logout': 'خروج',

    // Hero Section
    'hero.title': 'ابحث عن سكن طلابي مثالي',
    'hero.subtitle': 'ابحث عن عقارات للإيجار، زملاء السكن، والشقق المشتركة',
    'hero.location': 'الموقع',
    'hero.propertyType': 'نوع العقار',
    'hero.priceRange': 'نطاق السعر',
    'hero.search': 'بحث',
    'hero.apartment': 'شقة',
    'hero.room': 'غرفة',
    'hero.roommate': 'زميل سكن',

    // Stats
    'stats.properties': 'عقارات',
    'stats.students': 'طلاب',
    'stats.agents': 'وكلاء',
    'stats.satisfied': 'عملاء راضون',

    // Properties Section
    'properties.featured': 'عقارات مميزة',
    'properties.viewAll': 'عرض الكل',
    'properties.bedrooms': 'غرف نوم',
    'properties.bathrooms': 'حمامات',
    'properties.area': 'المساحة',
    'properties.month': 'شهر',

    // Properties Page
    'propertiesPage.title': 'تصفح العقارات',
    'propertiesPage.subtitle': 'اعثر على منزلك المثالي في مصر',
    'propertiesPage.filters': 'الفلاتر',
    'propertiesPage.city': 'المدينة',
    'propertiesPage.type': 'النوع',
    'propertiesPage.minPrice': 'الحد الأدنى للسعر',
    'propertiesPage.maxPrice': 'الحد الأقصى للسعر',
    'propertiesPage.clearFilters': 'مسح الفلاتر',
    'propertiesPage.found': 'تم العثور على',
    'propertiesPage.noProperties': 'لا توجد عقارات',
    'propertiesPage.adjustFilters': 'حاول تعديل الفلاتر',
    'propertiesPage.viewDetails': 'عرض التفاصيل',
    'propertiesPage.whatsapp': 'واتساب',
    'propertiesPage.views': 'مشاهدات',
    'propertiesPage.likes': 'إعجابات',

    // Services
    'services.title': 'خدمات المنزل',
    'services.viewProviders': 'عرض مقدمي الخدمة',

    // Post Page
    'post.title': 'إنشاء منشور',
    'post.subtitle': 'ابحث عن زميل سكن أو غرفة',
    'post.type': 'نوع المنشور',
    'post.property': 'عقار',
    'post.propertyDesc': 'أضف عقار',
    'post.lookingRoommate': 'البحث عن زميل سكن',
    'post.lookingRoommateDesc': 'ابحث عن شخص للمشاركة',
    'post.lookingRoom': 'البحث عن غرفة',
    'post.lookingRoomDesc': 'ابحث عن مكان للإقامة',
    'post.titleLabel': 'العنوان',
    'post.description': 'الوصف',
    'post.descriptionPlaceholder': 'صف عقارك أو متطلباتك...',

    // How It Works
    'howItWorks.whyTitle': 'لماذا تختارنا',
    'howItWorks.mainTitle': 'نحن نهتم ب',
    'howItWorks.mainTitleHighlight': 'تجربة البحث',
    'howItWorks.mainTitleEnd': 'عن المنزل',
    'howItWorks.verified': 'عقارات موثقة',
    'howItWorks.verifiedDesc': 'جميع العقارات موثقة ومفتشة من أجل سلامتك',
    'howItWorks.trusted': 'ملاك موثوقون',
    'howItWorks.trustedDesc': 'تواصل مع أصحاب عقارات موثقين وموثوقين',
    'howItWorks.communication': 'تواصل سهل',
    'howItWorks.communicationDesc': 'مراسلة مباشرة مع أصحاب العقارات واستجابة سريعة',
    'howItWorks.secure': 'دفع آمن',
    'howItWorks.secureDesc': 'اتفاقيات إيجار آمنة وشفافة ومعاملات موثوقة',
    'howItWorks.title': 'كيف يعمل؟',
    'howItWorks.subtitle': 'اتبع هذه الخطوات الأربع البسيطة للعثور على منزل الطالب المثالي والانتقال إليه في مصر.',
    'howItWorks.step1': 'البحث',
    'howItWorks.step1Desc': 'ابحث عن عقارات بالقرب من جامعتك.',
    'howItWorks.step2': 'التفاصيل',
    'howItWorks.step2Desc': 'تحقق من الصور والمرافق والتقييمات.',
    'howItWorks.step3': 'الاتصال',
    'howItWorks.step3Desc': 'راسل المالكين وحدد مواعيد الزيارات.',
    'howItWorks.step4': 'الانتقال',
    'howItWorks.step4Desc': 'أكمل الحجز واحصل على مفاتيحك.',
    'howItWorks.cta': 'ابدأ البحث الآن',
  },
  bn: {
    // Navigation
    'nav.home': 'হোম',
    'nav.properties': 'প্রপার্টি',
    'nav.services': 'সেবা',
    'nav.login': 'লগইন',
    'nav.getStarted': 'শুরু করুন',
    'nav.dashboard': 'ড্যাশবোর্ড',
    'nav.settings': 'সেটিংস',
    'nav.createPost': 'পোস্ট করুন',
    'nav.logout': 'লগআউট',

    // Hero Section
    'hero.title': 'আপনার পারফেক্ট স্টুডেন্ট হাউজিং খুঁজুন',
    'hero.subtitle': 'ভাড়া, রুমমেট এবং শেয়ার্ড অ্যাপার্টমেন্টের জন্য প্রপার্টি খুঁজুন',
    'hero.location': 'লোকেশন',
    'hero.propertyType': 'প্রপার্টির ধরন',
    'hero.priceRange': 'মূল্য সীমা',
    'hero.search': 'খুঁজুন',
    'hero.apartment': 'অ্যাপার্টমেন্ট',
    'hero.room': 'রুম',
    'hero.roommate': 'রুমমেট',

    // Stats
    'stats.properties': 'প্রপার্টি',
    'stats.students': 'স্টুডেন্ট',
    'stats.agents': 'এজেন্ট',
    'stats.satisfied': 'সন্তুষ্ট ক্লায়েন্ট',

    // Properties Section
    'properties.featured': 'ফিচার্ড প্রপার্টি',
    'properties.viewAll': 'সব দেখুন',
    'properties.bedrooms': 'বেডরুম',
    'properties.bathrooms': 'বাথরুম',
    'properties.area': 'এরিয়া',
    'properties.month': 'মাস',

    // Properties Page
    'propertiesPage.title': 'প্রপার্টি ব্রাউজ করুন',
    'propertiesPage.subtitle': 'মিশরে আপনার পারফেক্ট বাড়ি খুঁজুন',
    'propertiesPage.filters': 'ফিল্টার',
    'propertiesPage.city': 'শহর',
    'propertiesPage.type': 'টাইপ',
    'propertiesPage.minPrice': 'মিনিমাম মূল্য',
    'propertiesPage.maxPrice': 'ম্যাক্সিমাম মূল্য',
    'propertiesPage.clearFilters': 'ফিল্টার ক্লিয়ার করুন',
    'propertiesPage.found': 'পাওয়া গেছে',
    'propertiesPage.noProperties': 'কোনো প্রপার্টি পাওয়া যায়নি',
    'propertiesPage.adjustFilters': 'ফিল্টার পরিবর্তন করে দেখুন',
    'propertiesPage.viewDetails': 'বিস্তারিত দেখুন',
    'propertiesPage.whatsapp': 'হোয়াটসঅ্যাপ',
    'propertiesPage.views': 'ভিউ',
    'propertiesPage.likes': 'লাইক',

    // Services
    'services.title': 'হোম সার্ভিস',
    'services.viewProviders': 'প্রোভাইডার দেখুন',

    // Post Page
    'post.title': 'পোস্ট তৈরি করুন',
    'post.subtitle': 'রুমমেট বা রুম খুঁজুন',
    'post.type': 'পোস্ট টাইপ',
    'post.property': 'প্রপার্টি',
    'post.propertyDesc': 'প্রপার্টি লিস্ট করুন',
    'post.lookingRoommate': 'রুমমেট খুঁজছি',
    'post.lookingRoommateDesc': 'শেয়ার করার জন্য কাউকে খুঁজুন',
    'post.lookingRoom': 'রুম খুঁজছি',
    'post.lookingRoomDesc': 'থাকার জায়গা খুঁজুন',
    'post.titleLabel': 'শিরোনাম',
    'post.description': 'বিবরণ',
    'post.descriptionPlaceholder': 'আপনার প্রপার্টি বা প্রয়োজনীয়তা বর্ণনা করুন...',

    // How It Works
    'howItWorks.whyTitle': 'কেন আমাদের বেছে নেবেন',
    'howItWorks.mainTitle': 'আমরা আপনার',
    'howItWorks.mainTitleHighlight': 'বাড়ি খোঁজার',
    'howItWorks.mainTitleEnd': 'অভিজ্ঞতার যত্ন নিই',
    'howItWorks.verified': 'যাচাইকৃত প্রপার্টি',
    'howItWorks.verifiedDesc': 'সব প্রপার্টি আপনার নিরাপত্তার জন্য যাচাই ও পরিদর্শন করা',
    'howItWorks.trusted': 'বিশ্বস্ত বাড়িওয়ালা',
    'howItWorks.trustedDesc': 'যাচাইকৃত এবং বিশ্বস্ত প্রপার্টি মালিকদের সাথে সংযোগ করুন',
    'howItWorks.communication': 'সহজ যোগাযোগ',
    'howItWorks.communicationDesc': 'প্রপার্টি মালিকদের সাথে সরাসরি মেসেজিং এবং দ্রুত প্রতিক্রিয়া',
    'howItWorks.secure': 'নিরাপদ পেমেন্ট',
    'howItWorks.secureDesc': 'নিরাপদ এবং স্বচ্ছ ভাড়া চুক্তি এবং লেনদেন',
    'howItWorks.title': 'এটি কিভাবে কাজ করে?',
    'howItWorks.subtitle': 'মিশরে আপনার নিখুঁত স্টুডেন্ট হোম খুঁজে পেতে এবং সেখানে যেতে এই ৪টি সহজ ধাপ অনুসরণ করুন।',
    'howItWorks.step1': 'খুঁজুন',
    'howItWorks.step1Desc': 'আপনার বিশ্ববিদ্যালয়ের কাছাকাছি প্রপার্টি খুঁজুন।',
    'howItWorks.step2': 'বিবরণ',
    'howItWorks.step2Desc': 'ছবি, সুবিধা এবং রিভিউ চেক করুন।',
    'howItWorks.step3': 'যোগাযোগ',
    'howItWorks.step3Desc': 'মালিকদের মেসেজ করুন এবং ভিজিট শিডিউল করুন।',
    'howItWorks.step4': 'মুভ ইন',
    'howItWorks.step4Desc': 'বুকিং সম্পূর্ণ করুন এবং আপনার চাবি নিন।',
    'howItWorks.cta': 'এখনই খোঁজা শুরু করুন',
  },
  id: {
    // Navigation
    'nav.home': 'Beranda',
    'nav.properties': 'Properti',
    'nav.services': 'Layanan',
    'nav.login': 'Masuk',
    'nav.getStarted': 'Mulai',
    'nav.dashboard': 'Dasbor',
    'nav.settings': 'Pengaturan',
    'nav.createPost': 'Buat Post',
    'nav.logout': 'Keluar',

    // Hero Section
    'hero.title': 'Temukan Hunian Mahasiswa Sempurna Anda',
    'hero.subtitle': 'Cari properti untuk disewa, teman sekamar, dan apartemen bersama',
    'hero.location': 'Lokasi',
    'hero.propertyType': 'Tipe Properti',
    'hero.priceRange': 'Rentang Harga',
    'hero.search': 'Cari',
    'hero.apartment': 'Apartemen',
    'hero.room': 'Kamar',
    'hero.roommate': 'Teman Sekamar',

    // Stats
    'stats.properties': 'Properti',
    'stats.students': 'Mahasiswa',
    'stats.agents': 'Agen',
    'stats.satisfied': 'Klien Puas',

    // Properties Section
    'properties.featured': 'Properti Unggulan',
    'properties.viewAll': 'Lihat Semua',
    'properties.bedrooms': 'Kamar Tidur',
    'properties.bathrooms': 'Kamar Mandi',
    'properties.area': 'Luas',
    'properties.month': 'bulan',

    // Properties Page
    'propertiesPage.title': 'Jelajahi Properti',
    'propertiesPage.subtitle': 'Temukan rumah sempurna Anda di Mesir',
    'propertiesPage.filters': 'Filter',
    'propertiesPage.city': 'Kota',
    'propertiesPage.type': 'Tipe',
    'propertiesPage.minPrice': 'Harga Min',
    'propertiesPage.maxPrice': 'Harga Maks',
    'propertiesPage.clearFilters': 'Hapus Filter',
    'propertiesPage.found': 'Ditemukan',
    'propertiesPage.noProperties': 'Tidak ada properti',
    'propertiesPage.adjustFilters': 'Coba sesuaikan filter Anda',
    'propertiesPage.viewDetails': 'Lihat Detail',
    'propertiesPage.whatsapp': 'WhatsApp',
    'propertiesPage.views': 'tampilan',
    'propertiesPage.likes': 'suka',

    // Services
    'services.title': 'Layanan Rumah',
    'services.viewProviders': 'Lihat Penyedia',

    // Post Page & How It Works (using English template)
    'post.title': 'Create Post',
    'post.subtitle': 'Find a roommate or room',
    'post.type': 'Post Type',
    'post.property': 'Property',
    'post.propertyDesc': 'List a property',
    'post.lookingRoommate': 'Looking for Roommate',
    'post.lookingRoommateDesc': 'Find someone to share',
    'post.lookingRoom': 'Looking for Room',
    'post.lookingRoomDesc': 'Find a place to stay',
    'post.titleLabel': 'Title',
    'post.description': 'Description',
    'post.descriptionPlaceholder': 'Describe your property or requirements...',
    'howItWorks.whyTitle': 'Why Choose Us',
    'howItWorks.mainTitle': 'We care about your',
    'howItWorks.mainTitleHighlight': 'home search',
    'howItWorks.mainTitleEnd': 'experience',
    'howItWorks.verified': 'Verified Properties',
    'howItWorks.verifiedDesc': 'All properties are verified and inspected for your safety',
    'howItWorks.trusted': 'Trusted Landlords',
    'howItWorks.trustedDesc': 'Connect with verified and trusted property owners',
    'howItWorks.communication': 'Easy Communication',
    'howItWorks.communicationDesc': 'Direct messaging with property owners and quick responses',
    'howItWorks.secure': 'Secure Payments',
    'howItWorks.secureDesc': 'Safe and transparent rental agreements and transactions',
    'howItWorks.title': 'How it Works?',
    'howItWorks.subtitle': 'Follow these 4 simple steps to find and move into your perfect student home in Egypt.',
    'howItWorks.step1': 'Search',
    'howItWorks.step1Desc': 'Find properties near your university.',
    'howItWorks.step2': 'Details',
    'howItWorks.step2Desc': 'Check photos, amenities, and reviews.',
    'howItWorks.step3': 'Contact',
    'howItWorks.step3Desc': 'Message owners and schedule visits.',
    'howItWorks.step4': 'Move In',
    'howItWorks.step4Desc': 'Complete booking and get your keys.',
    'howItWorks.cta': 'Start Searching Now',
  },
  uz: {
    // Navigation
    'nav.home': 'Bosh sahifa',
    'nav.properties': 'Mulklar',
    'nav.services': 'Xizmatlar',
    'nav.login': 'Kirish',
    'nav.getStarted': 'Boshlash',
    'nav.dashboard': 'Boshqaruv',
    'nav.settings': 'Sozlamalar',
    'nav.createPost': 'Post yaratish',
    'nav.logout': 'Chiqish',

    // Hero Section
    'hero.title': 'Mukammal Talaba Uyini Toping',
    'hero.subtitle': 'Ijara, xonadon va umumiy kvartiralar uchun mulklar qidiring',
    'hero.location': 'Manzil',
    'hero.propertyType': 'Mulk Turi',
    'hero.priceRange': 'Narx Diapazoni',
    'hero.search': 'Qidirish',
    'hero.apartment': 'Kvartira',
    'hero.room': 'Xona',
    'hero.roommate': 'Xonadon',

    // Stats
    'stats.properties': 'Mulklar',
    'stats.students': 'Talabalar',
    'stats.agents': 'Agentlar',
    'stats.satisfied': 'Mamnun Mijozlar',

    // Properties Section
    'properties.featured': 'Ajoyib Mulklar',
    'properties.viewAll': 'Barchasini Ko\'rish',
    'properties.bedrooms': 'Yotoq Xonalari',
    'properties.bathrooms': 'Hammomlar',
    'properties.area': 'Maydon',
    'properties.month': 'oy',

    // Properties Page
    'propertiesPage.title': 'Mulklarni Ko\'rish',
    'propertiesPage.subtitle': 'Misrda mukammal uyingizni toping',
    'propertiesPage.filters': 'Filtrlar',
    'propertiesPage.city': 'Shahar',
    'propertiesPage.type': 'Turi',
    'propertiesPage.minPrice': 'Min Narx',
    'propertiesPage.maxPrice': 'Maks Narx',
    'propertiesPage.clearFilters': 'Filtrlarni Tozalash',
    'propertiesPage.found': 'Topildi',
    'propertiesPage.noProperties': 'Mulk topilmadi',
    'propertiesPage.adjustFilters': 'Filtrlarni o\'zgartiring',
    'propertiesPage.viewDetails': 'Batafsil',
    'propertiesPage.whatsapp': 'WhatsApp',
    'propertiesPage.views': 'ko\'rishlar',
    'propertiesPage.likes': 'yoqtirishlar',

    // Services
    'services.title': 'Uy Xizmatlari',
    'services.viewProviders': 'Provayderlarni Ko\'rish',

    // Post Page & How It Works (using English template)
    'post.title': 'Create Post',
    'post.subtitle': 'Find a roommate or room',
    'post.type': 'Post Type',
    'post.property': 'Property',
    'post.propertyDesc': 'List a property',
    'post.lookingRoommate': 'Looking for Roommate',
    'post.lookingRoommateDesc': 'Find someone to share',
    'post.lookingRoom': 'Looking for Room',
    'post.lookingRoomDesc': 'Find a place to stay',
    'post.titleLabel': 'Title',
    'post.description': 'Description',
    'post.descriptionPlaceholder': 'Describe your property or requirements...',
    'howItWorks.whyTitle': 'Why Choose Us',
    'howItWorks.mainTitle': 'We care about your',
    'howItWorks.mainTitleHighlight': 'home search',
    'howItWorks.mainTitleEnd': 'experience',
    'howItWorks.verified': 'Verified Properties',
    'howItWorks.verifiedDesc': 'All properties are verified and inspected for your safety',
    'howItWorks.trusted': 'Trusted Landlords',
    'howItWorks.trustedDesc': 'Connect with verified and trusted property owners',
    'howItWorks.communication': 'Easy Communication',
    'howItWorks.communicationDesc': 'Direct messaging with property owners and quick responses',
    'howItWorks.secure': 'Secure Payments',
    'howItWorks.secureDesc': 'Safe and transparent rental agreements and transactions',
    'howItWorks.title': 'How it Works?',
    'howItWorks.subtitle': 'Follow these 4 simple steps to find and move into your perfect student home in Egypt.',
    'howItWorks.step1': 'Search',
    'howItWorks.step1Desc': 'Find properties near your university.',
    'howItWorks.step2': 'Details',
    'howItWorks.step2Desc': 'Check photos, amenities, and reviews.',
    'howItWorks.step3': 'Contact',
    'howItWorks.step3Desc': 'Message owners and schedule visits.',
    'howItWorks.step4': 'Move In',
    'howItWorks.step4Desc': 'Complete booking and get your keys.',
    'howItWorks.cta': 'Start Searching Now',
  },
  ru: {
    // Navigation
    'nav.home': 'Главная',
    'nav.properties': 'Недвижимость',
    'nav.services': 'Услуги',
    'nav.login': 'Войти',
    'nav.getStarted': 'Начать',
    'nav.dashboard': 'Панель',
    'nav.settings': 'Настройки',
    'nav.createPost': 'Создать',
    'nav.logout': 'Выйти',

    // Hero Section
    'hero.title': 'Найдите Идеальное Студенческое Жилье',
    'hero.subtitle': 'Поиск недвижимости для аренды, соседей и общих квартир',
    'hero.location': 'Местоположение',
    'hero.propertyType': 'Тип Недвижимости',
    'hero.priceRange': 'Ценовой Диапазон',
    'hero.search': 'Поиск',
    'hero.apartment': 'Квартира',
    'hero.room': 'Комната',
    'hero.roommate': 'Сосед',

    // Stats
    'stats.properties': 'Объектов',
    'stats.students': 'Студентов',
    'stats.agents': 'Агентов',
    'stats.satisfied': 'Довольных Клиентов',

    // Properties Section
    'properties.featured': 'Избранные Объекты',
    'properties.viewAll': 'Смотреть Все',
    'properties.bedrooms': 'Спальни',
    'properties.bathrooms': 'Ванные',
    'properties.area': 'Площадь',
    'properties.month': 'месяц',

    // Properties Page
    'propertiesPage.title': 'Просмотр Объектов',
    'propertiesPage.subtitle': 'Найдите свой идеальный дом в Египте',
    'propertiesPage.filters': 'Фильтры',
    'propertiesPage.city': 'Город',
    'propertiesPage.type': 'Тип',
    'propertiesPage.minPrice': 'Мин Цена',
    'propertiesPage.maxPrice': 'Макс Цена',
    'propertiesPage.clearFilters': 'Очистить Фильтры',
    'propertiesPage.found': 'Найдено',
    'propertiesPage.noProperties': 'Объекты не найдены',
    'propertiesPage.adjustFilters': 'Попробуйте изменить фильтры',
    'propertiesPage.viewDetails': 'Подробнее',
    'propertiesPage.whatsapp': 'WhatsApp',
    'propertiesPage.views': 'просмотров',
    'propertiesPage.likes': 'лайков',

    // Services
    'services.title': 'Домашние Услуги',
    'services.viewProviders': 'Смотреть Поставщиков',

    // Post Page & How It Works (using English template)
    'post.title': 'Create Post',
    'post.subtitle': 'Find a roommate or room',
    'post.type': 'Post Type',
    'post.property': 'Property',
    'post.propertyDesc': 'List a property',
    'post.lookingRoommate': 'Looking for Roommate',
    'post.lookingRoommateDesc': 'Find someone to share',
    'post.lookingRoom': 'Looking for Room',
    'post.lookingRoomDesc': 'Find a place to stay',
    'post.titleLabel': 'Title',
    'post.description': 'Description',
    'post.descriptionPlaceholder': 'Describe your property or requirements...',
    'howItWorks.whyTitle': 'Why Choose Us',
    'howItWorks.mainTitle': 'We care about your',
    'howItWorks.mainTitleHighlight': 'home search',
    'howItWorks.mainTitleEnd': 'experience',
    'howItWorks.verified': 'Verified Properties',
    'howItWorks.verifiedDesc': 'All properties are verified and inspected for your safety',
    'howItWorks.trusted': 'Trusted Landlords',
    'howItWorks.trustedDesc': 'Connect with verified and trusted property owners',
    'howItWorks.communication': 'Easy Communication',
    'howItWorks.communicationDesc': 'Direct messaging with property owners and quick responses',
    'howItWorks.secure': 'Secure Payments',
    'howItWorks.secureDesc': 'Safe and transparent rental agreements and transactions',
    'howItWorks.title': 'How it Works?',
    'howItWorks.subtitle': 'Follow these 4 simple steps to find and move into your perfect student home in Egypt.',
    'howItWorks.step1': 'Search',
    'howItWorks.step1Desc': 'Find properties near your university.',
    'howItWorks.step2': 'Details',
    'howItWorks.step2Desc': 'Check photos, amenities, and reviews.',
    'howItWorks.step3': 'Contact',
    'howItWorks.step3Desc': 'Message owners and schedule visits.',
    'howItWorks.step4': 'Move In',
    'howItWorks.step4Desc': 'Complete booking and get your keys.',
    'howItWorks.cta': 'Start Searching Now',
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.properties': 'Propriétés',
    'nav.services': 'Services',
    'nav.login': 'Connexion',
    'nav.getStarted': 'Commencer',
    'nav.dashboard': 'Tableau de bord',
    'nav.settings': 'Paramètres',
    'nav.createPost': 'Créer',
    'nav.logout': 'Déconnexion',

    // Hero Section
    'hero.title': 'Trouvez Votre Logement Étudiant Parfait',
    'hero.subtitle': 'Recherchez des propriétés à louer, des colocataires et des appartements partagés',
    'hero.location': 'Emplacement',
    'hero.propertyType': 'Type de Propriété',
    'hero.priceRange': 'Gamme de Prix',
    'hero.search': 'Rechercher',
    'hero.apartment': 'Appartement',
    'hero.room': 'Chambre',
    'hero.roommate': 'Colocataire',

    // Stats
    'stats.properties': 'Propriétés',
    'stats.students': 'Étudiants',
    'stats.agents': 'Agents',
    'stats.satisfied': 'Clients Satisfaits',

    // Properties Section
    'properties.featured': 'Propriétés en Vedette',
    'properties.viewAll': 'Voir Tout',
    'properties.bedrooms': 'Chambres',
    'properties.bathrooms': 'Salles de Bain',
    'properties.area': 'Surface',
    'properties.month': 'mois',

    // Properties Page
    'propertiesPage.title': 'Parcourir les Propriétés',
    'propertiesPage.subtitle': 'Trouvez votre maison parfaite en Égypte',
    'propertiesPage.filters': 'Filtres',
    'propertiesPage.city': 'Ville',
    'propertiesPage.type': 'Type',
    'propertiesPage.minPrice': 'Prix Min',
    'propertiesPage.maxPrice': 'Prix Max',
    'propertiesPage.clearFilters': 'Effacer les Filtres',
    'propertiesPage.found': 'Trouvé',
    'propertiesPage.noProperties': 'Aucune propriété trouvée',
    'propertiesPage.adjustFilters': 'Essayez d\'ajuster vos filtres',
    'propertiesPage.viewDetails': 'Voir les Détails',
    'propertiesPage.whatsapp': 'WhatsApp',
    'propertiesPage.views': 'vues',
    'propertiesPage.likes': 'j\'aime',

    // Services
    'services.title': 'Services à Domicile',
    'services.viewProviders': 'Voir les Fournisseurs',

    // Post Page & How It Works (using English template)
    'post.title': 'Create Post',
    'post.subtitle': 'Find a roommate or room',
    'post.type': 'Post Type',
    'post.property': 'Property',
    'post.propertyDesc': 'List a property',
    'post.lookingRoommate': 'Looking for Roommate',
    'post.lookingRoommateDesc': 'Find someone to share',
    'post.lookingRoom': 'Looking for Room',
    'post.lookingRoomDesc': 'Find a place to stay',
    'post.titleLabel': 'Title',
    'post.description': 'Description',
    'post.descriptionPlaceholder': 'Describe your property or requirements...',
    'howItWorks.whyTitle': 'Why Choose Us',
    'howItWorks.mainTitle': 'We care about your',
    'howItWorks.mainTitleHighlight': 'home search',
    'howItWorks.mainTitleEnd': 'experience',
    'howItWorks.verified': 'Verified Properties',
    'howItWorks.verifiedDesc': 'All properties are verified and inspected for your safety',
    'howItWorks.trusted': 'Trusted Landlords',
    'howItWorks.trustedDesc': 'Connect with verified and trusted property owners',
    'howItWorks.communication': 'Easy Communication',
    'howItWorks.communicationDesc': 'Direct messaging with property owners and quick responses',
    'howItWorks.secure': 'Secure Payments',
    'howItWorks.secureDesc': 'Safe and transparent rental agreements and transactions',
    'howItWorks.title': 'How it Works?',
    'howItWorks.subtitle': 'Follow these 4 simple steps to find and move into your perfect student home in Egypt.',
    'howItWorks.step1': 'Search',
    'howItWorks.step1Desc': 'Find properties near your university.',
    'howItWorks.step2': 'Details',
    'howItWorks.step2Desc': 'Check photos, amenities, and reviews.',
    'howItWorks.step3': 'Contact',
    'howItWorks.step3Desc': 'Message owners and schedule visits.',
    'howItWorks.step4': 'Move In',
    'howItWorks.step4Desc': 'Complete booking and get your keys.',
    'howItWorks.cta': 'Start Searching Now',
  },
  kk: {
    // Navigation
    'nav.home': 'Басты бет',
    'nav.properties': 'Мүлік',
    'nav.services': 'Қызметтер',
    'nav.login': 'Кіру',
    'nav.getStarted': 'Бастау',
    'nav.dashboard': 'Басқару',
    'nav.settings': 'Параметрлер',
    'nav.createPost': 'Жасау',
    'nav.logout': 'Шығу',

    // Hero Section
    'hero.title': 'Студенттік Үйіңізді Табыңыз',
    'hero.subtitle': 'Жалға алу, бөлмелес және ортақ пәтерлерді іздеңіз',
    'hero.location': 'Орны',
    'hero.propertyType': 'Мүлік Түрі',
    'hero.priceRange': 'Баға Диапазоны',
    'hero.search': 'Іздеу',
    'hero.apartment': 'Пәтер',
    'hero.room': 'Бөлме',
    'hero.roommate': 'Бөлмелес',

    // Stats
    'stats.properties': 'Мүлік',
    'stats.students': 'Студенттер',
    'stats.agents': 'Агенттер',
    'stats.satisfied': 'Қанағаттанған Клиенттер',

    // Properties Section
    'properties.featured': 'Таңдаулы Мүлік',
    'properties.viewAll': 'Барлығын Көру',
    'properties.bedrooms': 'Жатын Бөлмелер',
    'properties.bathrooms': 'Жуынатын Бөлмелер',
    'properties.area': 'Аумақ',
    'properties.month': 'ай',

    // Properties Page
    'propertiesPage.title': 'Мүлікті Шолу',
    'propertiesPage.subtitle': 'Мысырда өзіңіздің үйіңізді табыңыз',
    'propertiesPage.filters': 'Сүзгілер',
    'propertiesPage.city': 'Қала',
    'propertiesPage.type': 'Түрі',
    'propertiesPage.minPrice': 'Мин Баға',
    'propertiesPage.maxPrice': 'Макс Баға',
    'propertiesPage.clearFilters': 'Сүзгілерді Тазалау',
    'propertiesPage.found': 'Табылды',
    'propertiesPage.noProperties': 'Мүлік табылмады',
    'propertiesPage.adjustFilters': 'Сүзгілерді өзгертіп көріңіз',
    'propertiesPage.viewDetails': 'Толығырақ',
    'propertiesPage.whatsapp': 'WhatsApp',
    'propertiesPage.views': 'көрулер',
    'propertiesPage.likes': 'ұнатулар',

    // Services
    'services.title': 'Үй Қызметтері',
    'services.viewProviders': 'Жабдықтаушыларды Көру',

    // Post Page & How It Works (using English template)
    'post.title': 'Create Post',
    'post.subtitle': 'Find a roommate or room',
    'post.type': 'Post Type',
    'post.property': 'Property',
    'post.propertyDesc': 'List a property',
    'post.lookingRoommate': 'Looking for Roommate',
    'post.lookingRoommateDesc': 'Find someone to share',
    'post.lookingRoom': 'Looking for Room',
    'post.lookingRoomDesc': 'Find a place to stay',
    'post.titleLabel': 'Title',
    'post.description': 'Description',
    'post.descriptionPlaceholder': 'Describe your property or requirements...',
    'howItWorks.whyTitle': 'Why Choose Us',
    'howItWorks.mainTitle': 'We care about your',
    'howItWorks.mainTitleHighlight': 'home search',
    'howItWorks.mainTitleEnd': 'experience',
    'howItWorks.verified': 'Verified Properties',
    'howItWorks.verifiedDesc': 'All properties are verified and inspected for your safety',
    'howItWorks.trusted': 'Trusted Landlords',
    'howItWorks.trustedDesc': 'Connect with verified and trusted property owners',
    'howItWorks.communication': 'Easy Communication',
    'howItWorks.communicationDesc': 'Direct messaging with property owners and quick responses',
    'howItWorks.secure': 'Secure Payments',
    'howItWorks.secureDesc': 'Safe and transparent rental agreements and transactions',
    'howItWorks.title': 'How it Works?',
    'howItWorks.subtitle': 'Follow these 4 simple steps to find and move into your perfect student home in Egypt.',
    'howItWorks.step1': 'Search',
    'howItWorks.step1Desc': 'Find properties near your university.',
    'howItWorks.step2': 'Details',
    'howItWorks.step2Desc': 'Check photos, amenities, and reviews.',
    'howItWorks.step3': 'Contact',
    'howItWorks.step3Desc': 'Message owners and schedule visits.',
    'howItWorks.step4': 'Move In',
    'howItWorks.step4Desc': 'Complete booking and get your keys.',
    'howItWorks.cta': 'Start Searching Now',
  },
  ms: {
    // Navigation
    'nav.home': 'Utama',
    'nav.properties': 'Hartanah',
    'nav.services': 'Perkhidmatan',
    'nav.login': 'Log Masuk',
    'nav.getStarted': 'Mula',
    'nav.dashboard': 'Papan Pemuka',
    'nav.settings': 'Tetapan',
    'nav.createPost': 'Buat',
    'nav.logout': 'Log Keluar',

    // Hero Section
    'hero.title': 'Cari Perumahan Pelajar Sempurna Anda',
    'hero.subtitle': 'Cari hartanah untuk disewa, rakan sebilik, dan pangsapuri berkongsi',
    'hero.location': 'Lokasi',
    'hero.propertyType': 'Jenis Hartanah',
    'hero.priceRange': 'Julat Harga',
    'hero.search': 'Cari',
    'hero.apartment': 'Pangsapuri',
    'hero.room': 'Bilik',
    'hero.roommate': 'Rakan Sebilik',

    // Stats
    'stats.properties': 'Hartanah',
    'stats.students': 'Pelajar',
    'stats.agents': 'Ejen',
    'stats.satisfied': 'Pelanggan Berpuas Hati',

    // Properties Section
    'properties.featured': 'Hartanah Pilihan',
    'properties.viewAll': 'Lihat Semua',
    'properties.bedrooms': 'Bilik Tidur',
    'properties.bathrooms': 'Bilik Mandi',
    'properties.area': 'Kawasan',
    'properties.month': 'bulan',

    // Properties Page
    'propertiesPage.title': 'Semak Hartanah',
    'propertiesPage.subtitle': 'Cari rumah sempurna anda di Mesir',
    'propertiesPage.filters': 'Penapis',
    'propertiesPage.city': 'Bandar',
    'propertiesPage.type': 'Jenis',
    'propertiesPage.minPrice': 'Harga Min',
    'propertiesPage.maxPrice': 'Harga Maks',
    'propertiesPage.clearFilters': 'Kosongkan Penapis',
    'propertiesPage.found': 'Dijumpai',
    'propertiesPage.noProperties': 'Tiada hartanah dijumpai',
    'propertiesPage.adjustFilters': 'Cuba laraskan penapis anda',
    'propertiesPage.viewDetails': 'Lihat Butiran',
    'propertiesPage.whatsapp': 'WhatsApp',
    'propertiesPage.views': 'tontonan',
    'propertiesPage.likes': 'suka',

    // Services
    'services.title': 'Perkhidmatan Rumah',
    'services.viewProviders': 'Lihat Pembekal',

    // Post Page & How It Works (using English template)
    'post.title': 'Create Post',
    'post.subtitle': 'Find a roommate or room',
    'post.type': 'Post Type',
    'post.property': 'Property',
    'post.propertyDesc': 'List a property',
    'post.lookingRoommate': 'Looking for Roommate',
    'post.lookingRoommateDesc': 'Find someone to share',
    'post.lookingRoom': 'Looking for Room',
    'post.lookingRoomDesc': 'Find a place to stay',
    'post.titleLabel': 'Title',
    'post.description': 'Description',
    'post.descriptionPlaceholder': 'Describe your property or requirements...',
    'howItWorks.whyTitle': 'Why Choose Us',
    'howItWorks.mainTitle': 'We care about your',
    'howItWorks.mainTitleHighlight': 'home search',
    'howItWorks.mainTitleEnd': 'experience',
    'howItWorks.verified': 'Verified Properties',
    'howItWorks.verifiedDesc': 'All properties are verified and inspected for your safety',
    'howItWorks.trusted': 'Trusted Landlords',
    'howItWorks.trustedDesc': 'Connect with verified and trusted property owners',
    'howItWorks.communication': 'Easy Communication',
    'howItWorks.communicationDesc': 'Direct messaging with property owners and quick responses',
    'howItWorks.secure': 'Secure Payments',
    'howItWorks.secureDesc': 'Safe and transparent rental agreements and transactions',
    'howItWorks.title': 'How it Works?',
    'howItWorks.subtitle': 'Follow these 4 simple steps to find and move into your perfect student home in Egypt.',
    'howItWorks.step1': 'Search',
    'howItWorks.step1Desc': 'Find properties near your university.',
    'howItWorks.step2': 'Details',
    'howItWorks.step2Desc': 'Check photos, amenities, and reviews.',
    'howItWorks.step3': 'Contact',
    'howItWorks.step3Desc': 'Message owners and schedule visits.',
    'howItWorks.step4': 'Move In',
    'howItWorks.step4Desc': 'Complete booking and get your keys.',
    'howItWorks.cta': 'Start Searching Now',
  },
  uz: {
    // Navigation
    'nav.home': 'Bosh sahifa',
    'nav.properties': 'Mulklar',
    'nav.services': 'Xizmatlar',
    'nav.login': 'Kirish',
    'nav.getStarted': 'Boshlash',
    'nav.dashboard': 'Boshqaruv',
    'nav.settings': 'Sozlamalar',
    'nav.createPost': 'Post yaratish',
    'nav.logout': 'Chiqish',

    // Hero Section
    'hero.title': 'Mukammal Talaba Uyini Toping',
    'hero.subtitle': 'Ijara, xonadon va umumiy kvartiralar uchun mulklar qidiring',
    'hero.location': 'Manzil',
    'hero.propertyType': 'Mulk Turi',
    'hero.priceRange': 'Narx Diapazoni',
    'hero.search': 'Qidirish',
    'hero.apartment': 'Kvartira',
    'hero.room': 'Xona',
    'hero.roommate': 'Xonadon',

    // Stats
    'stats.properties': 'Mulklar',
    'stats.students': 'Talabalar',
    'stats.agents': 'Agentlar',
    'stats.satisfied': 'Mamnun Mijozlar',

    // Properties Section
    'properties.featured': 'Ajoyib Mulklar',
    'properties.viewAll': 'Barchasini Ko\'rish',
    'properties.bedrooms': 'Yotoq Xonalari',
    'properties.bathrooms': 'Hammomlar',
    'properties.area': 'Maydon',
    'properties.month': 'oy',

    // Properties Page
    'propertiesPage.title': 'Mulklarni Ko\'rish',
    'propertiesPage.subtitle': 'Misrda mukammal uyingizni toping',
    'propertiesPage.filters': 'Filtrlar',
    'propertiesPage.city': 'Shahar',
    'propertiesPage.type': 'Turi',
    'propertiesPage.minPrice': 'Min Narx',
    'propertiesPage.maxPrice': 'Maks Narx',
    'propertiesPage.clearFilters': 'Filtrlarni Tozalash',
    'propertiesPage.found': 'Topildi',
    'propertiesPage.noProperties': 'Mulk topilmadi',
    'propertiesPage.adjustFilters': 'Filtrlarni o\'zgartiring',
    'propertiesPage.viewDetails': 'Batafsil',
    'propertiesPage.whatsapp': 'WhatsApp',
    'propertiesPage.views': 'ko\'rishlar',
    'propertiesPage.likes': 'yoqtirishlar',

    // Services
    'services.title': 'Uy Xizmatlari',
    'services.viewProviders': 'Provayderlarni Ko\'rish',
  },
  ru: {
    // Navigation
    'nav.home': 'Главная',
    'nav.properties': 'Недвижимость',
    'nav.services': 'Услуги',
    'nav.login': 'Войти',
    'nav.getStarted': 'Начать',
    'nav.dashboard': 'Панель',
    'nav.settings': 'Настройки',
    'nav.createPost': 'Создать',
    'nav.logout': 'Выйти',

    // Hero Section
    'hero.title': 'Найдите Идеальное Студенческое Жилье',
    'hero.subtitle': 'Поиск недвижимости для аренды, соседей и общих квартир',
    'hero.location': 'Местоположение',
    'hero.propertyType': 'Тип Недвижимости',
    'hero.priceRange': 'Ценовой Диапазон',
    'hero.search': 'Поиск',
    'hero.apartment': 'Квартира',
    'hero.room': 'Комната',
    'hero.roommate': 'Сосед',

    // Stats
    'stats.properties': 'Объектов',
    'stats.students': 'Студентов',
    'stats.agents': 'Агентов',
    'stats.satisfied': 'Довольных Клиентов',

    // Properties Section
    'properties.featured': 'Избранные Объекты',
    'properties.viewAll': 'Смотреть Все',
    'properties.bedrooms': 'Спальни',
    'properties.bathrooms': 'Ванные',
    'properties.area': 'Площадь',
    'properties.month': 'месяц',

    // Properties Page
    'propertiesPage.title': 'Просмотр Объектов',
    'propertiesPage.subtitle': 'Найдите свой идеальный дом в Египте',
    'propertiesPage.filters': 'Фильтры',
    'propertiesPage.city': 'Город',
    'propertiesPage.type': 'Тип',
    'propertiesPage.minPrice': 'Мин Цена',
    'propertiesPage.maxPrice': 'Макс Цена',
    'propertiesPage.clearFilters': 'Очистить Фильтры',
    'propertiesPage.found': 'Найдено',
    'propertiesPage.noProperties': 'Объекты не найдены',
    'propertiesPage.adjustFilters': 'Попробуйте изменить фильтры',
    'propertiesPage.viewDetails': 'Подробнее',
    'propertiesPage.whatsapp': 'WhatsApp',
    'propertiesPage.views': 'просмотров',
    'propertiesPage.likes': 'лайков',

    // Services
    'services.title': 'Домашние Услуги',
    'services.viewProviders': 'Смотреть Поставщиков',
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.properties': 'Propriétés',
    'nav.services': 'Services',
    'nav.login': 'Connexion',
    'nav.getStarted': 'Commencer',
    'nav.dashboard': 'Tableau de bord',
    'nav.settings': 'Paramètres',
    'nav.createPost': 'Créer',
    'nav.logout': 'Déconnexion',

    // Hero Section
    'hero.title': 'Trouvez Votre Logement Étudiant Parfait',
    'hero.subtitle': 'Recherchez des propriétés à louer, des colocataires et des appartements partagés',
    'hero.location': 'Emplacement',
    'hero.propertyType': 'Type de Propriété',
    'hero.priceRange': 'Gamme de Prix',
    'hero.search': 'Rechercher',
    'hero.apartment': 'Appartement',
    'hero.room': 'Chambre',
    'hero.roommate': 'Colocataire',

    // Stats
    'stats.properties': 'Propriétés',
    'stats.students': 'Étudiants',
    'stats.agents': 'Agents',
    'stats.satisfied': 'Clients Satisfaits',

    // Properties Section
    'properties.featured': 'Propriétés en Vedette',
    'properties.viewAll': 'Voir Tout',
    'properties.bedrooms': 'Chambres',
    'properties.bathrooms': 'Salles de Bain',
    'properties.area': 'Surface',
    'properties.month': 'mois',

    // Properties Page
    'propertiesPage.title': 'Parcourir les Propriétés',
    'propertiesPage.subtitle': 'Trouvez votre maison parfaite en Égypte',
    'propertiesPage.filters': 'Filtres',
    'propertiesPage.city': 'Ville',
    'propertiesPage.type': 'Type',
    'propertiesPage.minPrice': 'Prix Min',
    'propertiesPage.maxPrice': 'Prix Max',
    'propertiesPage.clearFilters': 'Effacer les Filtres',
    'propertiesPage.found': 'Trouvé',
    'propertiesPage.noProperties': 'Aucune propriété trouvée',
    'propertiesPage.adjustFilters': 'Essayez d\'ajuster vos filtres',
    'propertiesPage.viewDetails': 'Voir les Détails',
    'propertiesPage.whatsapp': 'WhatsApp',
    'propertiesPage.views': 'vues',
    'propertiesPage.likes': 'j\'aime',

    // Services
    'services.title': 'Services à Domicile',
    'services.viewProviders': 'Voir les Fournisseurs',
  },
  kk: {
    // Navigation
    'nav.home': 'Басты бет',
    'nav.properties': 'Мүлік',
    'nav.services': 'Қызметтер',
    'nav.login': 'Кіру',
    'nav.getStarted': 'Бастау',
    'nav.dashboard': 'Басқару',
    'nav.settings': 'Параметрлер',
    'nav.createPost': 'Жасау',
    'nav.logout': 'Шығу',

    // Hero Section
    'hero.title': 'Студенттік Үйіңізді Табыңыз',
    'hero.subtitle': 'Жалға алу, бөлмелес және ортақ пәтерлерді іздеңіз',
    'hero.location': 'Орны',
    'hero.propertyType': 'Мүлік Түрі',
    'hero.priceRange': 'Баға Диапазоны',
    'hero.search': 'Іздеу',
    'hero.apartment': 'Пәтер',
    'hero.room': 'Бөлме',
    'hero.roommate': 'Бөлмелес',

    // Stats
    'stats.properties': 'Мүлік',
    'stats.students': 'Студенттер',
    'stats.agents': 'Агенттер',
    'stats.satisfied': 'Қанағаттанған Клиенттер',

    // Properties Section
    'properties.featured': 'Таңдаулы Мүлік',
    'properties.viewAll': 'Барлығын Көру',
    'properties.bedrooms': 'Жатын Бөлмелер',
    'properties.bathrooms': 'Жуынатын Бөлмелер',
    'properties.area': 'Аумақ',
    'properties.month': 'ай',

    // Properties Page
    'propertiesPage.title': 'Мүлікті Шолу',
    'propertiesPage.subtitle': 'Мысырда өзіңіздің үйіңізді табыңыз',
    'propertiesPage.filters': 'Сүзгілер',
    'propertiesPage.city': 'Қала',
    'propertiesPage.type': 'Түрі',
    'propertiesPage.minPrice': 'Мин Баға',
    'propertiesPage.maxPrice': 'Макс Баға',
    'propertiesPage.clearFilters': 'Сүзгілерді Тазалау',
    'propertiesPage.found': 'Табылды',
    'propertiesPage.noProperties': 'Мүлік табылмады',
    'propertiesPage.adjustFilters': 'Сүзгілерді өзгертіп көріңіз',
    'propertiesPage.viewDetails': 'Толығырақ',
    'propertiesPage.whatsapp': 'WhatsApp',
    'propertiesPage.views': 'көрулер',
    'propertiesPage.likes': 'ұнатулар',

    // Services
    'services.title': 'Үй Қызметтері',
    'services.viewProviders': 'Жабдықтаушыларды Көру',
  },
  ms: {
    // Navigation
    'nav.home': 'Utama',
    'nav.properties': 'Hartanah',
    'nav.services': 'Perkhidmatan',
    'nav.login': 'Log Masuk',
    'nav.getStarted': 'Mula',
    'nav.dashboard': 'Papan Pemuka',
    'nav.settings': 'Tetapan',
    'nav.createPost': 'Buat',
    'nav.logout': 'Log Keluar',

    // Hero Section
    'hero.title': 'Cari Perumahan Pelajar Sempurna Anda',
    'hero.subtitle': 'Cari hartanah untuk disewa, rakan sebilik, dan pangsapuri berkongsi',
    'hero.location': 'Lokasi',
    'hero.propertyType': 'Jenis Hartanah',
    'hero.priceRange': 'Julat Harga',
    'hero.search': 'Cari',
    'hero.apartment': 'Pangsapuri',
    'hero.room': 'Bilik',
    'hero.roommate': 'Rakan Sebilik',

    // Stats
    'stats.properties': 'Hartanah',
    'stats.students': 'Pelajar',
    'stats.agents': 'Ejen',
    'stats.satisfied': 'Pelanggan Berpuas Hati',

    // Properties Section
    'properties.featured': 'Hartanah Pilihan',
    'properties.viewAll': 'Lihat Semua',
    'properties.bedrooms': 'Bilik Tidur',
    'properties.bathrooms': 'Bilik Mandi',
    'properties.area': 'Kawasan',
    'properties.month': 'bulan',

    // Properties Page
    'propertiesPage.title': 'Semak Hartanah',
    'propertiesPage.subtitle': 'Cari rumah sempurna anda di Mesir',
    'propertiesPage.filters': 'Penapis',
    'propertiesPage.city': 'Bandar',
    'propertiesPage.type': 'Jenis',
    'propertiesPage.minPrice': 'Harga Min',
    'propertiesPage.maxPrice': 'Harga Maks',
    'propertiesPage.clearFilters': 'Kosongkan Penapis',
    'propertiesPage.found': 'Dijumpai',
    'propertiesPage.noProperties': 'Tiada hartanah dijumpai',
    'propertiesPage.adjustFilters': 'Cuba laraskan penapis anda',
    'propertiesPage.viewDetails': 'Lihat Butiran',
    'propertiesPage.whatsapp': 'WhatsApp',
    'propertiesPage.views': 'tontonan',
    'propertiesPage.likes': 'suka',

    // Services
    'services.title': 'Perkhidmatan Rumah',
    'services.viewProviders': 'Lihat Pembekal',
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language
    if (saved) {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string): string => {
    return translations[language]?.[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}