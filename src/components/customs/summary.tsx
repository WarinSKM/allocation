import { Typography } from "../ui/typography";

interface SummaryProps {
  title: string;
  value: string;
  description: string;
}

export default function Summary({ description, title, value }: SummaryProps) {
  return (
    <div className="flex flex-col items-start space-y-1">
      <Typography variant="p">
        {title}
      </Typography>
      <Typography variant="h1" as="p">
        {value}
      </Typography>
      <Typography variant="sub" as="span">
        {description}
      </Typography>
    </div>
  );
}
