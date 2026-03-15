import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export default function Subscription() {
    const [user, setUser] = useState(null);
    const [userLoading, setUserLoading] = useState(true);
    const queryClient = useQueryClient();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await base44.auth.me();
                setUser(userData);
            } catch (error) {
                console.error("Failed to fetch user data:", error);
                setUser(null);
            } finally {
                setUserLoading(false);
            }
        };
        fetchUser();
    }, []); // Empty dependency array means this runs once on mount

    const planType = user?.account_type === 'restaurant_owner' ? 'restaurant' : 'client';
    const currentSub = user?.account_type === 'restaurant_owner' 
        ? user?.restaurants?.[0]?.subscription_tier 
        : user?.subscription_status;

    const { data: plans, isLoading: plansLoading } = useQuery({
        queryKey: ['subscriptionPlans', planType],
        queryFn: () => base44.entities.SubscriptionPlan.filter({ plan_type: planType }),
        enabled: !!user, // Only fetch plans if user data is available
    });

    const updateUserSub = useMutation({
        mutationFn: (status) => base44.auth.updateMe({ subscription_status: status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user'] });
            // Re-fetch user data to update the local state in this component after a successful mutation
            // This is important because the local `user` state isn't managed by React Query for `['user']` key.
            base44.auth.me().then(setUser).catch(console.error);
            alert('Subscription Updated!');
        }
    });

    const updateRestaurantSub = useMutation({
        mutationFn: ({ id, tier }) => base44.entities.Restaurant.update(id, { subscription_tier: tier }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myRestaurants'] });
            // Re-fetch user data to update the local state in this component after a successful mutation
            base44.auth.me().then(setUser).catch(console.error);
            alert('Subscription Updated!');
        }
    });

    const handleSubscribe = (plan) => {
        if (!user) {
            alert('User data not loaded yet. Please try again.');
            return;
        }

        if (planType === 'client') {
            updateUserSub.mutate(plan.name.toLowerCase());
        } else if (planType === 'restaurant') {
            // Assuming user has one restaurant for simplicity
            if (user.restaurants && user.restaurants.length > 0) {
                updateRestaurantSub.mutate({ id: user.restaurants[0].id, tier: plan.name.toLowerCase() });
            } else {
                alert('Please create a restaurant first.');
            }
        }
    };
    
    if (userLoading || plansLoading) {
        return <div className="text-center p-10">Loading plans...</div>
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <h1 className="text-4xl font-bold text-center mb-4">Subscription Plans</h1>
            <p className="text-xl text-gray-600 text-center mb-12">Choose the plan that's right for you.</p>

            <div className="grid md:grid-cols-2 gap-8">
                {plans?.map(plan => (
                    <Card key={plan.id} className={currentSub === plan.name.toLowerCase() ? 'border-orange-500 border-2' : ''}>
                        <CardHeader>
                            <CardTitle className="text-2xl">{plan.name}</CardTitle>
                            <CardDescription>
                                <span className="text-4xl font-bold">${plan.price}</span>
                                <span className="text-gray-500">/month</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {plan.features.map(feature => (
                                    <li key={feature} className="flex items-center gap-3">
                                        <Check className="w-5 h-5 text-green-500" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            {currentSub === plan.name.toLowerCase() ? (
                                <Button disabled className="w-full">Current Plan</Button>
                            ) : (
                                <Button onClick={() => handleSubscribe(plan)} className="w-full bg-orange-500 hover:bg-orange-600">
                                    {plan.price > 0 ? 'Upgrade' : 'Downgrade'}
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
