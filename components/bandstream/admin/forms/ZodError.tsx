interface ZodErrorProps {
    message?: string;
  }
  
  export function ZodError({ message }: ZodErrorProps) {
    if (!message) return null;
    
    return (
      <p className="text-red-500 text-sm mt-2">{message}</p>
    );
  }