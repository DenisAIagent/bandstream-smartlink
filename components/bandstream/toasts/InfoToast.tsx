import { CheckCircle } from "lucide-react";

interface InfoToastProps {
    icon?: React.ReactNode;
    message: string;
}

export const InfoToast: React.FC<InfoToastProps> = ({ message }) => (
    <div className="w-full flex items-center">
        <div className="mr-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
        </div>
        <span className="first-letter:capitalize">
            {message}
        </span>
    </div>
);