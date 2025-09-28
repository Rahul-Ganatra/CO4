'use client';

import DataManager from '@/components/DataManager';
import { useTranslation } from '@/hooks/useTranslation';

export default function About() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            {t('about.title')}
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-600 mb-6">
              {t('about.description')}
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              {t('about.features.title')}
            </h2>
            
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li><strong>{t('about.features.visual').split(':')[0]}:</strong> {t('about.features.visual').split(':')[1]}</li>
              <li><strong>{t('about.features.ai').split(':')[0]}:</strong> {t('about.features.ai').split(':')[1]}</li>
              <li><strong>{t('about.features.offline').split(':')[0]}:</strong> {t('about.features.offline').split(':')[1]}</li>
              <li><strong>{t('about.features.multilang').split(':')[0]}:</strong> {t('about.features.multilang').split(':')[1]}</li>
              <li><strong>{t('about.features.mobile').split(':')[0]}:</strong> {t('about.features.mobile').split(':')[1]}</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              {t('about.how.title')}
            </h2>
            
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>{t('about.how.step1')}</li>
              <li>{t('about.how.step2')}</li>
              <li>{t('about.how.step3')}</li>
              <li>{t('about.how.step4')}</li>
              <li>{t('about.how.step5')}</li>
            </ol>
          </div>
          
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('data.title')}</h2>
            <DataManager />
          </div>
        </div>
      </div>
    </main>
  );
}
