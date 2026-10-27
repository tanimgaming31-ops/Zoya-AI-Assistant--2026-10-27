# Android ফোন থেকে Zoya চালু করার নিয়ম

1. GitHub-এ এই রিপোজিটরি খুলুন: https://github.com/tanimgaming31-ops/Zoya-AI-Assistant--2026-10-27
2. Settings > Pages > Build and deployment > Source থেকে **GitHub Actions** নির্বাচন করুন।
3. Actions ট্যাবে **Zoya Build and Deploy** নির্বাচন করে Run workflow চাপুন। অথবা main branch-এ নতুন commit দিলে স্বয়ংক্রিয়ভাবে চলবে।
4. Build এবং Deploy শেষ হলে Settings > Pages-এ HTTPS URL দেখাবে।
5. Chrome-এ সেই লিংক খুলুন, Zoya Settings থেকে নিজের Google Gemini API key এবং About Me দিয়ে Save করুন।
6. কেন্দ্রের Microphone বোতাম ট্যাপ করে Android-এ Microphone Allow করুন।

এটি ওয়েব অ্যাপ, APK নয়। Maya-র কোনো ফাইল বদলানো হয়নি। Gemini Live চালানোর জন্য ইন্টারনেট, বৈধ API key ও মডেল অ্যাক্সেস প্রয়োজন।

## GitHub Pages চালু না থাকলে
প্রকল্পের সব ফাইল ও বিল্ড ডাউনলোড করার সুযোগ থাকবে; কিন্তু লাইভ লিংক কাজ করবে না। শুধু রিপোজিটরির মালিক `Settings > Pages > Build and deployment > Source > GitHub Actions` চালু করতে পারবেন। তারপর Actions থেকে Zoya Build and Deploy আবার চালাতে হবে।
