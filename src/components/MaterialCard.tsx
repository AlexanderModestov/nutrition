"use client";

import Link from "next/link";
import { Video, FileText, ExternalLink, Mic, Clock, User, Calendar } from "lucide-react";

interface Material {
  id: string;
  title: string;
  type: "video" | "text" | "url" | "podcast" | "quiz";
  shortDescription: string;
  fullDescription: string;
  content: any;
  tags: string[];
  createdAt: string;
  author: string;
}

interface MaterialCardProps {
  material: Material;
}

const MaterialCard = ({ material }: MaterialCardProps) => {
  const getIcon = () => {
    switch (material.type) {
      case "video":
        return <Video className="h-5 w-5 text-knowledge-video" />;
      case "text":
        return <FileText className="h-5 w-5 text-knowledge-text" />;
      case "url":
        return <ExternalLink className="h-5 w-5 text-knowledge-url" />;
      case "podcast":
        return <Mic className="h-5 w-5 text-knowledge-video" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getCardClass = () => {
    switch (material.type) {
      case "video":
        return "video-card";
      case "text":
        return "text-card";
      case "url":
        return "url-card";
      case "podcast":
        return "video-card";
      default:
        return "knowledge-card";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getHref = () => {
    if (material.type === "text") {
      return `/texts/${material.id}`;
    }
    return `/${material.content?.driveFileId || material.id}`;
  };

  return (
    <Link href={getHref()} className="block group">
      <div className={`${getCardClass()} hover-lift group-hover:knowledge-glow`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getIcon()}
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {material.type}
            </span>
          </div>
          {material.content?.difficulty && (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                material.content.difficulty
              )}`}
            >
              {material.content.difficulty}
            </span>
          )}
        </div>

        <h3 className="text-xl font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors">
          {material.title}
        </h3>

        <p className="text-muted-foreground mb-4 line-clamp-3">
          {material.shortDescription}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {material.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium"
            >
              {tag}
            </span>
          ))}
          {material.tags.length > 3 && (
            <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium">
              +{material.tags.length - 3} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{material.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(material.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          {(material.content?.duration || material.content?.readTime) && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{material.content.duration || material.content.readTime}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default MaterialCard;