import { Card } from '@/components/ui/Card';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
          About AI Content Detector
        </h1>
        <p className="text-xl sm:text-2xl text-white/80 max-w-2xl mx-auto">
          Empowering content authenticity through advanced AI detection
        </p>
      </div>

         {/* Mission Section */}
         <Card className="mb-16 p-10 bg-black/80 border border-purple-500/20 bg-gradient-to-b from-purple-500/5 to-transparent">
           <h2 className="text-3xl font-semibold text-white mb-6">Our Mission</h2>
           <p className="text-white/80 mb-8 text-lg max-w-3xl">
             We're dedicated to maintaining the integrity of online content by providing cutting-edge AI detection tools.
             Our mission is to help content creators, educators, and publishers ensure the authenticity of their content
             in an increasingly AI-driven world.
           </p>                                                  <div className="grid md:grid-cols-3 gap-8 mt-12">
             <div className="text-center">
               <div className="w-20 h-20 mx-auto mb-5 bg-black text-purple-400 rounded-xl flex items-center justify-center shadow-[0_8px_16px_-4px_rgba(0,0,0,0.3),0_4px_8px_-4px_rgba(168,85,247,0.4)]">
                 <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                 </svg>
               </div>
               <h3 className="text-lg font-semibold mb-3 text-white">Fast Detection</h3>
               <p className="text-base text-white/80">Quick and accurate content analysis in seconds</p>
             </div>

             <div className="text-center">
               <div className="w-20 h-20 mx-auto mb-5 bg-black text-purple-400 rounded-xl flex items-center justify-center shadow-[0_8px_16px_-4px_rgba(0,0,0,0.3),0_4px_8px_-4px_rgba(168,85,247,0.4)]">
                 <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                 </svg>
               </div>
               <h3 className="text-lg font-semibold mb-3 text-white">Reliable Results</h3>
               <p className="text-base text-white/80">Advanced algorithms for trustworthy analysis</p>
             </div>

             <div className="text-center">
               <div className="w-20 h-20 mx-auto mb-5 bg-black text-purple-400 rounded-xl flex items-center justify-center shadow-[0_8px_16px_-4px_rgba(0,0,0,0.3),0_4px_8px_-4px_rgba(168,85,247,0.4)]">
                 <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                 </svg>
               </div>
               <h3 className="text-lg font-semibold mb-3 text-white">Secure Platform</h3>
               <p className="text-base text-white/80">Your content privacy is our priority</p>
             </div>
           </div>
      </Card>

      {/* Technology Section */}
         <Card className="mb-8 p-8 bg-black/80 border border-purple-500/20 bg-gradient-to-b from-purple-500/5 to-transparent">
           <h2 className="text-3xl font-semibold text-white mb-6">Our Technology</h2>
        <p className="text-white/80 mb-8 text-lg max-w-3xl">
          Our AI content detection system uses state-of-the-art machine learning models trained on vast datasets
          of human and AI-generated content. We continuously improve our algorithms to stay ahead of advancing
          AI text generation technologies.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="rounded-xl p-6 bg-black shadow-[0_8px_16px_-4px_rgba(0,0,0,0.3),0_4px_8px_-4px_rgba(168,85,247,0.2)] border border-purple-500/20">
            <h3 className="font-semibold text-lg mb-4 text-white">Detection Features</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-white/80 hover:text-purple-400 transition-colors">
                <svg className="w-6 h-6 mr-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Pattern Analysis
              </li>
              <li className="flex items-center text-white/80 hover:text-purple-400 transition-colors">
                <svg className="w-6 h-6 mr-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Linguistic Analysis
              </li>
              <li className="flex items-center text-white/80 hover:text-purple-400 transition-colors">
                <svg className="w-6 h-6 mr-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Contextual Understanding
              </li>
            </ul>
          </div>

          <div className="rounded-xl p-6 bg-black shadow-[0_8px_16px_-4px_rgba(0,0,0,0.3),0_4px_8px_-4px_rgba(168,85,247,0.2)] border border-purple-500/20">
            <h3 className="font-semibold text-lg mb-4 text-white">Accuracy Metrics</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-white/80 hover:text-purple-400 transition-colors">
                <svg className="w-6 h-6 mr-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                95%+ Detection Accuracy
              </li>
              <li className="flex items-center text-white/80 hover:text-purple-400 transition-colors">
                <svg className="w-6 h-6 mr-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Low False Positive Rate
              </li>
              <li className="flex items-center text-white/80 hover:text-purple-400 transition-colors">
                <svg className="w-6 h-6 mr-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Real-time Processing
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Contact Section */}
         <Card className="p-8 bg-black/80 border border-purple-500/20 bg-gradient-to-b from-purple-500/5 to-transparent">
           <h2 className="text-3xl font-semibold text-white mb-6">Get in Touch</h2>
           <p className="text-white/80 mb-8 text-lg max-w-2xl">
          Have questions about our technology or interested in enterprise solutions? We'd love to hear from you.
        </p>
        <a
          href="/contact"
          className="inline-flex items-center px-8 py-4 text-base font-semibold rounded-xl 
                   bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700
                   text-white transition-all duration-200 ease-in-out transform hover:scale-[1.02]
                   shadow-[0_8px_16px_-4px_rgba(0,0,0,0.3),0_4px_8px_-4px_rgba(168,85,247,0.4)]
                   focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black"
        >
          <span className="mr-2">Contact Us</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </Card>
    </div>
  );
}
