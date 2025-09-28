'use client';

import { useState, useEffect } from 'react';
import { languageService } from '@/services/languageService';

// Translation maps for different languages
const translationsMap: Record<string, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.storyboard': 'Storyboard',
    'nav.about': 'About',
    'nav.signIn': 'Sign In',
    'nav.signOut': 'Sign Out',
    'status.online': 'Online',
    'status.offline': 'Offline',
    'status.sync': 'Sync',
    'status.lastSync': 'Last sync',
    'storage.used': 'Storage Used',
    'about.title': 'About TataStrive Business Plan Builder',
    'about.description': 'The TataStrive Business Plan Builder is designed specifically for rural entrepreneurs who want to create professional business plans without needing formal business education.',
    'about.features.title': 'Key Features',
    'about.features.visual': 'Visual Interface: Drag-and-drop storyboard builder',
    'about.features.ai': 'AI Guidance: Real-time feedback and tips',
    'about.features.offline': 'Offline First: Works without internet connectivity',
    'about.features.multilang': 'Multi-language: Support for regional languages',
    'about.features.mobile': 'Mobile Friendly: Optimized for smartphones',
    'about.how.title': 'How It Works',
    'about.how.step1': 'Start with a visual storyboard template',
    'about.how.step2': 'Add your business ideas using text, voice, or photos',
    'about.how.step3': 'Get AI feedback as you complete each section',
    'about.how.step4': 'Track your progress with gamification elements',
    'about.how.step5': 'Export your completed business plan',
    'data.title': 'Data Management',
    'data.export': 'Export Data',
    'data.description': 'Download all your business plans as a backup file',
    'auth.welcome': 'Welcome to TataStrive',
    'auth.createAccount': 'Create your account to get started',
    'auth.createAccountTitle': 'Create Account',
    'auth.signInTitle': 'Sign In',
    'auth.fullName': 'Full Name',
    'auth.email': 'Email Address',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.enterName': 'Enter your full name',
    'auth.enterEmail': 'Enter your email',
    'auth.enterPassword': 'Enter your password (min 6 characters)',
    'auth.confirmPasswordPlaceholder': 'Confirm your password',
    'auth.createAccountButton': 'Create Account',
    'auth.creatingAccount': 'Creating Account...',
    'auth.signInButton': 'Sign In',
    'auth.signingIn': 'Signing In...',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.signInHere': 'Sign in here',
    'auth.dontHaveAccount': "Don't have an account?",
    'auth.signUpHere': 'Sign up here'
  },
  hi: {
    'nav.home': 'होम',
    'nav.storyboard': 'स्टोरीबोर्ड',
    'nav.about': 'के बारे में',
    'nav.signIn': 'साइन इन',
    'nav.signOut': 'साइन आउट',
    'status.online': 'ऑनलाइन',
    'status.offline': 'ऑफलाइन',
    'status.sync': 'सिंक',
    'status.lastSync': 'अंतिम सिंक',
    'storage.used': 'स्टोरेज उपयोग',
    'about.title': 'टाटा स्ट्राइव बिजनेस प्लान बिल्डर के बारे में',
    'about.description': 'टाटा स्ट्राइव बिजनेस प्लान बिल्डर विशेष रूप से ग्रामीण उद्यमियों के लिए डिज़ाइन किया गया है जो औपचारिक व्यापारिक शिक्षा के बिना पेशेवर व्यापार योजनाएं बनाना चाहते हैं।',
    'about.features.title': 'मुख्य विशेषताएं',
    'about.features.visual': 'विजुअल इंटरफेस: ड्रैग-एंड-ड्रॉप स्टोरीबोर्ड बिल्डर',
    'about.features.ai': 'AI मार्गदर्शन: रियल-टाइम फीडबैक और सुझाव',
    'about.features.offline': 'ऑफलाइन फर्स्ट: इंटरनेट कनेक्टिविटी के बिना काम करता है',
    'about.features.multilang': 'बहुभाषी: क्षेत्रीय भाषाओं का समर्थन',
    'about.features.mobile': 'मोबाइल फ्रेंडली: स्मार्टफोन के लिए अनुकूलित',
    'about.how.title': 'यह कैसे काम करता है',
    'about.how.step1': 'एक विजुअल स्टोरीबोर्ड टेम्प्लेट से शुरू करें',
    'about.how.step2': 'टेक्स्ट, वॉइस या फोटो का उपयोग करके अपने व्यापारिक विचार जोड़ें',
    'about.how.step3': 'प्रत्येक सेक्शन पूरा करते समय AI फीडबैक प्राप्त करें',
    'about.how.step4': 'गेमिफिकेशन तत्वों के साथ अपनी प्रगति ट्रैक करें',
    'about.how.step5': 'अपनी पूर्ण व्यापार योजना निर्यात करें',
    'data.title': 'डेटा प्रबंधन',
    'data.export': 'डेटा निर्यात',
    'data.description': 'बैकअप फ़ाइल के रूप में अपनी सभी व्यापार योजनाएं डाउनलोड करें',
    'auth.welcome': 'टाटा स्ट्राइव में आपका स्वागत है',
    'auth.createAccount': 'शुरू करने के लिए अपना खाता बनाएं',
    'auth.createAccountTitle': 'खाता बनाएं',
    'auth.signInTitle': 'साइन इन करें',
    'auth.fullName': 'पूरा नाम',
    'auth.email': 'ईमेल पता',
    'auth.password': 'पासवर्ड',
    'auth.confirmPassword': 'पासवर्ड की पुष्टि करें',
    'auth.enterName': 'अपना पूरा नाम दर्ज करें',
    'auth.enterEmail': 'अपना ईमेल दर्ज करें',
    'auth.enterPassword': 'अपना पासवर्ड दर्ज करें (न्यूनतम 6 वर्ण)',
    'auth.confirmPasswordPlaceholder': 'अपने पासवर्ड की पुष्टि करें',
    'auth.createAccountButton': 'खाता बनाएं',
    'auth.creatingAccount': 'खाता बनाया जा रहा है...',
    'auth.signInButton': 'साइन इन करें',
    'auth.signingIn': 'साइन इन हो रहा है...',
    'auth.alreadyHaveAccount': 'पहले से खाता है?',
    'auth.signInHere': 'यहाँ साइन इन करें',
    'auth.dontHaveAccount': 'खाता नहीं है?',
    'auth.signUpHere': 'यहाँ साइन अप करें'
  },
  bn: {
    'nav.home': 'হোম',
    'nav.storyboard': 'স্টোরিবোর্ড',
    'nav.about': 'সম্পর্কে',
    'nav.signIn': 'সাইন ইন',
    'nav.signOut': 'সাইন আউট',
    'status.online': 'অনলাইন',
    'status.offline': 'অফলাইন',
    'status.sync': 'সিঙ্ক',
    'status.lastSync': 'শেষ সিঙ্ক',
    'storage.used': 'স্টোরেজ ব্যবহার',
    'about.title': 'টাটা স্ট্রাইভ বিজনেস প্ল্যান বিল্ডার সম্পর্কে',
    'about.description': 'টাটা স্ট্রাইভ বিজনেস প্ল্যান বিল্ডার বিশেষভাবে গ্রামীণ উদ্যোক্তাদের জন্য ডিজাইন করা হয়েছে যারা আনুষ্ঠানিক ব্যবসায়িক শিক্ষা ছাড়াই পেশাদার ব্যবসায়িক পরিকল্পনা তৈরি করতে চান।',
    'about.features.title': 'মূল বৈশিষ্ট্য',
    'about.features.visual': 'ভিজুয়াল ইন্টারফেস: ড্র্যাগ-এন্ড-ড্রপ স্টোরিবোর্ড বিল্ডার',
    'about.features.ai': 'AI গাইডেন্স: রিয়েল-টাইম ফিডব্যাক এবং টিপস',
    'about.features.offline': 'অফলাইন ফার্স্ট: ইন্টারনেট সংযোগ ছাড়াই কাজ করে',
    'about.features.multilang': 'বহুভাষিক: আঞ্চলিক ভাষার সমর্থন',
    'about.features.mobile': 'মোবাইল ফ্রেন্ডলি: স্মার্টফোনের জন্য অপ্টিমাইজড',
    'about.how.title': 'এটি কীভাবে কাজ করে',
    'about.how.step1': 'একটি ভিজুয়াল স্টোরিবোর্ড টেমপ্লেট দিয়ে শুরু করুন',
    'about.how.step2': 'টেক্সট, ভয়েস বা ফটো ব্যবহার করে আপনার ব্যবসায়িক ধারণা যোগ করুন',
    'about.how.step3': 'প্রতিটি বিভাগ সম্পূর্ণ করার সময় AI ফিডব্যাক পান',
    'about.how.step4': 'গেমিফিকেশন উপাদান দিয়ে আপনার অগ্রগতি ট্র্যাক করুন',
    'about.how.step5': 'আপনার সম্পূর্ণ ব্যবসায়িক পরিকল্পনা রপ্তানি করুন',
    'data.title': 'ডেটা ব্যবস্থাপনা',
    'data.export': 'ডেটা রপ্তানি',
    'data.description': 'ব্যাকআপ ফাইল হিসাবে আপনার সমস্ত ব্যবসায়িক পরিকল্পনা ডাউনলোড করুন',
    'auth.welcome': 'টাটা স্ট্রাইভে স্বাগতম',
    'auth.createAccount': 'শুরু করতে আপনার অ্যাকাউন্ট তৈরি করুন',
    'auth.createAccountTitle': 'অ্যাকাউন্ট তৈরি করুন',
    'auth.signInTitle': 'সাইন ইন করুন',
    'auth.fullName': 'পূর্ণ নাম',
    'auth.email': 'ইমেইল ঠিকানা',
    'auth.password': 'পাসওয়ার্ড',
    'auth.confirmPassword': 'পাসওয়ার্ড নিশ্চিত করুন',
    'auth.enterName': 'আপনার পূর্ণ নাম লিখুন',
    'auth.enterEmail': 'আপনার ইমেইল লিখুন',
    'auth.enterPassword': 'আপনার পাসওয়ার্ড লিখুন (সর্বনিম্ন ৬ অক্ষর)',
    'auth.confirmPasswordPlaceholder': 'আপনার পাসওয়ার্ড নিশ্চিত করুন',
    'auth.createAccountButton': 'অ্যাকাউন্ট তৈরি করুন',
    'auth.creatingAccount': 'অ্যাকাউন্ট তৈরি হচ্ছে...',
    'auth.signInButton': 'সাইন ইন করুন',
    'auth.signingIn': 'সাইন ইন হচ্ছে...',
    'auth.alreadyHaveAccount': 'ইতিমধ্যে অ্যাকাউন্ট আছে?',
    'auth.signInHere': 'এখানে সাইন ইন করুন',
    'auth.dontHaveAccount': 'অ্যাকাউন্ট নেই?',
    'auth.signUpHere': 'এখানে সাইন আপ করুন'
  },
  te: {
    'nav.home': 'హోమ్',
    'nav.storyboard': 'స్టోరీబోర్డ్',
    'nav.about': 'గురించి',
    'nav.signIn': 'సైన్ ఇన్',
    'nav.signOut': 'సైన్ అవుట్',
    'status.online': 'ఆన్‌లైన్',
    'status.offline': 'ఆఫ్‌లైన్',
    'status.sync': 'సింక్',
    'status.lastSync': 'చివరి సింక్',
    'storage.used': 'స్టోరేజ్ ఉపయోగం',
    'about.title': 'టాటా స్ట్రైవ్ బిజినెస్ ప్లాన్ బిల్డర్ గురించి',
    'about.description': 'టాటా స్ట్రైవ్ బిజినెస్ ప్లాన్ బిల్డర్ ప్రత్యేకంగా గ్రామీణ వ్యవస్థాపకుల కోసం రూపొందించబడింది, వారు అధికారిక వ్యాపార విద్య లేకుండా వృత్తిపరమైన వ్యాపార ప్రణాళికలను సృష్టించాలనుకుంటున్నారు.',
    'about.features.title': 'ప్రధాన లక్షణాలు',
    'about.features.visual': 'విజువల్ ఇంటర్‌ఫేస్: డ్రాగ్-అండ్-డ్రాప్ స్టోరీబోర్డ్ బిల్డర్',
    'about.features.ai': 'AI మార్గదర్శకత్వం: రియల్-టైమ్ ఫీడ్‌బ్యాక్ మరియు చిట్కాలు',
    'about.features.offline': 'ఆఫ్‌లైన్ ఫస్ట్: ఇంటర్నెట్ కనెక్టివిటీ లేకుండా పని చేస్తుంది',
    'about.features.multilang': 'బహుభాషా: ప్రాంతీయ భాషలకు మద్దతు',
    'about.features.mobile': 'మొబైల్ ఫ్రెండ్లీ: స్మార్ట్‌ఫోన్‌ల కోసం ఆప్టిమైజ్ చేయబడింది',
    'about.how.title': 'ఇది ఎలా పని చేస్తుంది',
    'about.how.step1': 'విజువల్ స్టోరీబోర్డ్ టెంప్లేట్‌తో ప్రారంభించండి',
    'about.how.step2': 'టెక్స్ట్, వాయిస్ లేదా ఫోటోలను ఉపయోగించి మీ వ్యాపార ఆలోచనలను జోడించండి',
    'about.how.step3': 'మీరు ప్రతి విభాగాన్ని పూర్తి చేసేటప్పుడు AI ఫీడ్‌బ్యాక్ పొందండి',
    'about.how.step4': 'గేమిఫికేషన్ అంశాలతో మీ పురోగతిని ట్రాక్ చేయండి',
    'about.how.step5': 'మీ పూర్తి వ్యాపార ప్రణాళికను ఎగుమతి చేయండి',
    'data.title': 'డేటా నిర్వహణ',
    'data.export': 'డేటా ఎగుమతి',
    'data.description': 'బ్యాకప్ ఫైల్‌గా మీ అన్ని వ్యాపార ప్రణాళికలను డౌన్‌లోడ్ చేయండి',
    'auth.welcome': 'టాటా స్ట్రైవ్‌కు స్వాగతం',
    'auth.createAccount': 'ప్రారంభించడానికి మీ ఖాతాను సృష్టించండి',
    'auth.createAccountTitle': 'ఖాతా సృష్టించండి',
    'auth.signInTitle': 'సైన్ ఇన్ చేయండి',
    'auth.fullName': 'పూర్తి పేరు',
    'auth.email': 'ఇమెయిల్ చిరునామా',
    'auth.password': 'పాస్‌వర్డ్',
    'auth.confirmPassword': 'పాస్‌వర్డ్‌ను నిర్ధారించండి',
    'auth.enterName': 'మీ పూర్తి పేరును నమోదు చేయండి',
    'auth.enterEmail': 'మీ ఇమెయిల్‌ను నమోదు చేయండి',
    'auth.enterPassword': 'మీ పాస్‌వర్డ్‌ను నమోదు చేయండి (కనీసం 6 అక్షరాలు)',
    'auth.confirmPasswordPlaceholder': 'మీ పాస్‌వర్డ్‌ను నిర్ధారించండి',
    'auth.createAccountButton': 'ఖాతా సృష్టించండి',
    'auth.creatingAccount': 'ఖాతా సృష్టించబడుతోంది...',
    'auth.signInButton': 'సైన్ ఇన్ చేయండి',
    'auth.signingIn': 'సైన్ ఇన్ అవుతోంది...',
    'auth.alreadyHaveAccount': 'ఇప్పటికే ఖాతా ఉందా?',
    'auth.signInHere': 'ఇక్కడ సైన్ ఇన్ చేయండి',
    'auth.dontHaveAccount': 'ఖాతా లేదా?',
    'auth.signUpHere': 'ఇక్కడ సైన్ అప్ చేయండి'
  }
};

export function useTranslation() {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    // Get initial language
    setCurrentLanguage(languageService.getCurrentLanguage());

    // Listen for language changes
    const handleLanguageChange = (event: CustomEvent) => {
      setCurrentLanguage(event.detail.language);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
      }
    };
  }, []);

  const t = (key: string, params?: Record<string, string>): string => {
    const translations = translationsMap[currentLanguage] || translationsMap.en;
    let translation = translations[key] || key;
    
    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{{${param}}}`, params[param]);
      });
    }
    
    return translation;
  };

  return { t, currentLanguage };
}
