import { ImageCreator } from '@/components/image-creator';
import { ExampleGallery } from '@/components/example-gallery';
import { Camera } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-blue-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-slate-900/80 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-2 rounded-lg">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Citability</h1>
              <p className="text-sm text-purple-300">Image Story Creator</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Consistent</span> Image Stories
          </h2>
          <p className="text-sm text-purple-200/80 max-w-xl mx-auto">
            Upload references, batch generate with AI, and download your story
          </p>
        </div>

        {/* Example Gallery */}
        <ExampleGallery />

        {/* Main App */}
        <ImageCreator />
      </div>
    </main>
  );
}
