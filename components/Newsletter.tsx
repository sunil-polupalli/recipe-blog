import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'next-i18next';

export default function Newsletter() {
  const { t } = useTranslation('common');
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [success, setSuccess] = useState(false);

  const onSubmit = () => setSuccess(true);

  if (success) {
    return <div data-testid="newsletter-success" className="p-4 bg-emerald-100 text-emerald-800 rounded-lg text-center font-medium">{t('subscribe_success')}</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} data-testid="newsletter-form" className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="text-2xl font-bold mb-2 text-center text-slate-900">{t('subscribe_title')}</h3>
      <p className="text-slate-500 text-center mb-6">{t('hero_subtitle')}</p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
          data-testid="newsletter-email"
          placeholder={t('subscribe_placeholder')}
          className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
        />
        <button 
          type="submit" 
          data-testid="newsletter-submit" 
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-lg transition-colors"
        >
          {t('subscribe_btn')}
        </button>
      </div>
      {errors.email && (
        <p data-testid="newsletter-error" className="text-red-500 text-sm mt-2 text-center">
          {t('subscribe_error')}
        </p>
      )}
    </form>
  );
}