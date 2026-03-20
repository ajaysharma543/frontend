import { useEffect, useState } from "react";

export function UseTimeAgo(timestamp) {
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    if (!timestamp) return;

    const update = () => {
      const now = new Date();
      const past = new Date(timestamp);
      const diff = Math.floor((now - past) / 1000); // seconds

      if (diff < 60) setTimeAgo("just now");
      else if (diff < 3600) setTimeAgo(`${Math.floor(diff / 60)} min ago`);
      else if (diff < 86400) setTimeAgo(`${Math.floor(diff / 3600)} hr ago`);
      else setTimeAgo(`${Math.floor(diff / 86400)} day ago`);
    };

    update();
    const interval = setInterval(update, 10000);

    return () => clearInterval(interval);
  }, [timestamp]);

  return timeAgo;
}

 export function TimeAgo (date){
    if (!date) return "";

    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);

    if (seconds < 60) return "Seen just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Seen ${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Seen ${hours} hr ago`;

    return new Date(date).toLocaleDateString();
  };

 export function GetTimeAgo(date){
  if (!date) return "";

  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr`;

  const days = Math.floor(hours / 24);
  return `${days} d`;
};