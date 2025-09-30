'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

const checklists = {
  'Basic Emergency Kit': [
    { id: 'bek-1', text: 'Water (one gallon per person per day for at least three days)' },
    { id: 'bek-2', text: 'Food (at least a three-day supply of non-perishable food)' },
    { id: 'bek-3', text: 'Battery-powered or hand crank radio and a NOAA Weather Radio' },
    { id: 'bek-4', text: 'Flashlight' },
    { id: 'bek-5', text: 'First aid kit' },
    { id: 'bek-6', text: 'Extra batteries' },
    { id: 'bek-7', text: 'Whistle to signal for help' },
    { id: 'bek-8', text: 'Dust mask to help filter contaminated air' },
    { id: 'bek-9', text: 'Moist towelettes, garbage bags and plastic ties for personal sanitation' },
    { id: 'bek-10', text: 'Wrench or pliers to turn off utilities' },
    { id: 'bek-11', text: 'Manual can opener for food' },
    { id: 'bek-12', text: 'Local maps' },
  ],
  'Wildfire Evacuation': [
    { id: 'we-1', text: 'Create a defensible space around your home (clear leaves, etc.)' },
    { id: 'we-2', text: 'Assemble a "Go Bag" with essentials' },
    { id: 'we-3', text: 'Know your community’s evacuation routes' },
    { id: 'we-4', text: 'Keep important documents in a fireproof, waterproof safe' },
    { id: 'we-5', text: 'Sign up for local emergency alerts' },
    { id: 'we-6', text: 'Have a plan for pets and livestock' },
  ],
};

type CheckedItems = {
  [key: string]: boolean;
};

export default function ChecklistPage() {
    const [checkedItems, setCheckedItems] = useState<CheckedItems>({});

    const handleCheckChange = (id: string) => {
        setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const getProgress = (list: { id: string }[]) => {
        const totalItems = list.length;
        if (totalItems === 0) return 0;
        const checkedCount = list.filter(item => checkedItems[item.id]).length;
        return (checkedCount / totalItems) * 100;
    };

    return (
        <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-headline font-bold">Emergency Checklists</h1>
                <p className="mt-2 text-muted-foreground text-lg">Stay prepared for any situation.</p>
            </div>

            <div className="space-y-8 max-w-4xl mx-auto">
                {Object.entries(checklists).map(([title, items]) => {
                    const progress = getProgress(items);
                    return (
                        <Card key={title}>
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl">{title}</CardTitle>
                                <div className="flex items-center gap-4 mt-2">
                                    <Progress value={progress} className="w-full h-2" />
                                    <span className="text-sm font-medium text-muted-foreground">{Math.round(progress)}%</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-4">
                                    {items.map(item => (
                                        <motion.li
                                            key={item.id}
                                            initial={{ opacity: 1, height: 'auto' }}
                                            animate={{ opacity: checkedItems[item.id] ? 0.5 : 1 }}
                                            transition={{ duration: 0.3 }}
                                            className="flex items-start"
                                        >
                                            <Checkbox
                                                id={item.id}
                                                checked={!!checkedItems[item.id]}
                                                onCheckedChange={() => handleCheckChange(item.id)}
                                                className="mr-3 mt-1"
                                            />
                                            <label
                                                htmlFor={item.id}
                                                className={`text-sm transition-colors ${
                                                    checkedItems[item.id] ? 'text-muted-foreground line-through' : 'text-foreground'
                                                }`}
                                            >
                                                {item.text}
                                            </label>
                                        </motion.li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
