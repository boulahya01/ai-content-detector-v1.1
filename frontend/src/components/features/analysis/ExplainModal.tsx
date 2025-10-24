import { useState, useRef, useEffect } from 'react';
import { 
  RiFileTextLine, 
  RiFlowChart, 
  RiGitBranchLine,
  RiCloseLine,
  RiShareLine,
  RiDownloadLine,
  RiInformationLine 
} from 'react-icons/ri';

type Indicator = {
  type: string;
  confidence: number; // 0..100 or 0..1
  description?: string;
};

interface Props {
  indicators: Indicator[];
}

const INDICATOR_ICONS: Record<string, JSX.Element> = {
  'Pattern Complexity': <RiFlowChart className="w-4 h-4" />,
  'Language Naturalness': <RiFileTextLine className="w-4 h-4" />,
  'Style Consistency': <RiGitBranchLine className="w-4 h-4" />
};

export default function ExplainModal({ indicators }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const getIndicatorStyles = (confidence: number) => {
  const baseOpacity = Math.max(0.4, Math.min(0.9, confidence / 100));
  
  return {
      progressStyle: {
      backgroundColor: 'var(--accent-500)',
      opacity: baseOpacity,
      boxShadow: '0 0 10px rgba(94, 23, 235, 0.2)'
    }
  };
};

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-sm text-white/80 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-all"
      >
        <RiInformationLine className="w-4 h-4" />
        <span>Explain</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur */}
          <div 
            className="fixed inset-0 backdrop-blur-md bg-black/30" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Modal */}
          <div
            className="relative bg-black/40 backdrop-blur-md rounded-lg w-full max-w-md border border-purple-500/20"
            style={{
         //     boxShadow: '0 0 30px rgba(59, 130, 246, 0.1)'
            }}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div>
              <div className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <RiFileTextLine className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-medium text-white/95">Analysis Details</h2>
                    <p className="text-xs text-white/60">AI content detection indicators</p>
                  </div>
                </div>
              </div>
              
              {/* Menu button and dropdown */}
              <div className="absolute right-2 top-2" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-1.5 text-white/70 hover:text-white/90"
                  aria-label="Menu"
                >
                  <span className="text-lg">•••</span>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-1 w-40 bg-black/80 backdrop-blur-sm rounded-lg border border-white/10 shadow-lg overflow-hidden">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/90 hover:bg-white/10"
                    >
                      <RiCloseLine className="w-4 h-4" />
                      <span>Close</span>
                    </button>
                    <button
                      onClick={() => {
                        // Add share functionality
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/90 hover:bg-white/10"
                    >
                      <RiShareLine className="w-4 h-4" />
                      <span>Share Results</span>
                    </button>
                    <button
                      onClick={() => {
                        // Add download functionality
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/90 hover:bg-white/10"
                    >
                      <RiDownloadLine className="w-4 h-4" />
                      <span>Download Report</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Content */}

            {/* Content */}
            <div className="p-4">
              <div className="space-y-6">
                {indicators.map((indicator) => {
                  const confidenceValue = indicator.confidence > 1 ? Math.round(indicator.confidence) : Math.round(indicator.confidence * 100);
                  
                  return (
                    <div key={indicator.type} className="group mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="text-purple-400">
                            {INDICATOR_ICONS[indicator.type]}
                          </div>
                          <h3 className="text-sm font-medium text-white/95">{indicator.type}</h3>
                        </div>
                        <span className="text-base tabular-nums font-semibold text-purple-400">
                          {confidenceValue}%
                        </span>
                      </div>
                      
                            <div className="h-2 bg-purple-950/40 rounded-full overflow-hidden">
                              <div 
                                className="h-full transition-all duration-500 ease-out"
                                style={{ 
                                  width: `${confidenceValue}%`,
                                  ...getIndicatorStyles(confidenceValue).progressStyle
                                }}
                              />
                            </div>
                      
                      <div className="mt-2">
                        <p className="text-xs text-white/50">
                          {indicator.type === 'Pattern Complexity' && 'Analysis of writing patterns and structure'}
                          {indicator.type === 'Language Naturalness' && 'Evaluation of natural language flow'}
                          {indicator.type === 'Style Consistency' && 'Measurement of writing style consistency'}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Legend section */}
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex -space-x-0.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgba(94, 23, 235, 0.2)' }} />
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgba(94, 23, 235, 0.6)' }} />
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent-500)' }} />
                    
                    </div>
                    <span className="text-xs font-medium text-white/70">Score ranges</span>
                    <div className="flex items-center gap-3 text-[10px] text-white/50 ml-auto">
                      <span>Low &lt;50%</span>
                      <span>Medium 50-79%</span>
                      <span>High 80%+</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center gap-2 p-2 rounded bg-white/[0.03]">
                      {INDICATOR_ICONS['Pattern Complexity']}
                      <span className="text-xs text-white/70">Structure</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-white/[0.03]">
                      {INDICATOR_ICONS['Language Naturalness']}
                      <span className="text-xs text-white/70">Flow</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-white/[0.03]">
                      {INDICATOR_ICONS['Style Consistency']}
                      <span className="text-xs text-white/70">Style</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
