import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function Newsletter() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [success, setSuccess] = useState(false);

  const onSubmit = () => setSuccess(true);

  if (success) {
    return <div data-testid="newsletter-success" className="p-4 bg-green-100 text-green-700">Subscribed!</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} data-testid="newsletter-form" className="max-w-md mx-auto my-8 p-4 border rounded">
      <h3 className="text-lg font-bold mb-4">Subscribe</h3>
      <div className="flex gap-2">
        <input
          {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
          data-testid="newsletter-email" // <--- REQUIRED ID
          placeholder="Email"
          className="flex-1 p-2 border rounded"
        />
        <button type="submit" data-testid="newsletter-submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Join
        </button>
      </div>
      {errors.email && (
        <p data-testid="newsletter-error" className="text-red-500 text-sm mt-2">Invalid email</p> // <--- REQUIRED ID
      )}
    </form>
  );
}