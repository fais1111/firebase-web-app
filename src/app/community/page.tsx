import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, ThumbsUp, UserCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

const forumPosts = [
  {
    id: 1,
    title: 'Tips for building a 72-hour "Go Bag"?',
    author: 'Alex "Prep" Johnson',
    avatar: 'https://picsum.photos/seed/alex/40/40',
    category: 'Gear & Kits',
    replies: 12,
    likes: 34,
    excerpt: "I'm putting together my first 72-hour kit. What are the absolute must-haves that people often forget? Looking for advice from experienced preppers.",
  },
  {
    id: 2,
    title: 'Best water purification methods for hiking?',
    author: 'Sarah "Hiker" Lee',
    avatar: 'https://picsum.photos/seed/sarah/40/40',
    category: 'Water & Food',
    replies: 8,
    likes: 22,
    excerpt: "I've been using tablets, but I'm considering a filter like the Sawyer Squeeze or Lifestraw. What are the pros and cons you've found in the field?",
  },
  {
    id: 3,
    title: 'How to create a defensible space for wildfire season?',
    author: 'Bob "Firewise" Miller',
    avatar: 'https://picsum.photos/seed/bob/40/40',
    category: 'Disaster Prep',
    replies: 5,
    likes: 18,
    excerpt: "Living in California, this is a yearly concern. I've cleared brush within 30 feet, but what other steps should I be taking to protect my home?",
  },
];

export default function CommunityPage() {
  return (
    <div className="bg-secondary min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-headline font-bold">Community Forum</h1>
          <p className="mt-2 text-muted-foreground text-lg">
            Share knowledge, ask questions, and connect with fellow survivors.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex gap-4">
            <Input placeholder="Search forum..." className="bg-background" />
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">New Post</Button>
          </div>

          <div className="space-y-6">
            {forumPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="secondary" className="mb-2">
                        {post.category}
                      </Badge>
                      <CardTitle className="font-headline text-xl">
                        <Link href="#" className="hover:underline">
                          {post.title}
                        </Link>
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={post.avatar} alt={post.author} />
                        <AvatarFallback>
                          {post.author.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{post.author}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{post.excerpt}</p>
                </CardContent>
                <CardFooter className="flex justify-between text-sm text-muted-foreground">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.replies} Replies</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{post.likes} Likes</span>
                    </div>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href="#">Read More</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
