import { XCircle } from "lucide-react";

interface ErrorToastProps {
    icon?: React.ReactNode;
    message: string;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({ message }) => (
    <div className="w-full flex items-center">
        <div className="mr-2">
          <XCircle className="h-4 w-4" />
        </div>
        <span className="first-letter:capitalize">
            {message}
        </span>
    </div>
);