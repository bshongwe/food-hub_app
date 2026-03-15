import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Store, ShieldAlert } from 'lucide-react';

function UserManagement() {
    const queryClient = useQueryClient();
    const { data: users, isLoading } = useQuery({
        queryKey: ['allUsers'],
        queryFn: () => base44.entities.User.list(),
    });

    const updateUser = useMutation({
        mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
        onSuccess: () => queryClient.invalidateQueries('allUsers'),
    });

    const toggleActive = (user) => {
        updateUser.mutate({ id: user.id, data: { is_active: !user.is_active }});
    };

    if (isLoading) return <div>Loading users...</div>;

    return (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users?.map(user => (
                        <TableRow key={user.id}>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.full_name}</TableCell>
                            <TableCell><Badge variant="secondary">{user.account_type || 'Client'}</Badge></TableCell>
                            <TableCell>
                                <Badge className={user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                    {user.is_active ? 'Active' : 'Suspended'}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Button size="sm" variant="outline" onClick={() => toggleActive(user)}>
                                    {user.is_active ? 'Suspend' : 'Activate'}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}

function RestaurantManagement() {
    const queryClient = useQueryClient();
    const { data: restaurants, isLoading } = useQuery({
        queryKey: ['allRestaurants'],
        queryFn: () => base44.entities.Restaurant.list(),
    });

    const updateRestaurant = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Restaurant.update(id, data),
        onSuccess: () => queryClient.invalidateQueries('allRestaurants'),
    });
    
    const toggleActive = (restaurant) => {
        updateRestaurant.mutate({ id: restaurant.id, data: { is_active: !restaurant.is_active } });
    };

    if (isLoading) return <div>Loading restaurants...</div>;

    return (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Subscription</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {restaurants?.map(r => (
                        <TableRow key={r.id}>
                            <TableCell>{r.name}</TableCell>
                            <TableCell>{r.owner_email}</TableCell>
                            <TableCell><Badge variant="outline">{r.subscription_tier}</Badge></TableCell>
                            <TableCell>
                                <Badge className={r.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                    {r.is_active ? 'Active' : 'Suspended'}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Button size="sm" variant="outline" onClick={() => toggleActive(r)}>
                                    {r.is_active ? 'Suspend' : 'Activate'}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}

function DisputeManagement() {
    const queryClient = useQueryClient();
    const { data: orders, isLoading } = useQuery({
        queryKey: ['disputedOrders'],
        queryFn: () => base44.entities.Order.filter({ status: 'disputed' }),
    });

    const updateOrder = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Order.update(id, data),
        onSuccess: () => queryClient.invalidateQueries('disputedOrders'),
    });

    const handleRefund = (order) => {
        updateOrder.mutate({ id: order.id, data: { payment_status: 'refunded', status: 'cancelled' } });
    };

    const handleDeny = (order) => {
        updateOrder.mutate({ id: order.id, data: { status: 'delivered' } }); // Or back to previous status
    };

    if (isLoading) return <div>Loading disputes...</div>;

    return (
        <div>
            {orders?.length === 0 ? <p>No active disputes.</p> : orders.map(order => (
                <Card key={order.id} className="p-4 mb-4">
                    <p><strong>Order ID:</strong> {order.id.slice(0, 8)}</p>
                    <p><strong>Restaurant:</strong> {order.restaurant_name}</p>
                    <p><strong>User:</strong> {order.user_email}</p>
                    <p><strong>Reason:</strong> {order.dispute_reason || 'No reason provided.'}</p>
                    <div className="mt-4 flex gap-3">
                        <Button size="sm" className="bg-green-600" onClick={() => handleRefund(order)}>Approve Refund</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeny(order)}>Deny Refund</Button>
                    </div>
                </Card>
            ))}
        </div>
    );
}


export default function AdminDashboard() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await base44.auth.me();
                setUser(userData);
            } catch (error) {
                // If fetching user fails (e.g., not authenticated or error), set user to null
                console.error("Failed to fetch user data:", error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, []);

    if (isLoading) return <div>Loading...</div>;
    if (user?.role !== 'admin') {
        return <div className="p-8 text-center text-red-500">Access Denied.</div>;
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <Tabs defaultValue="users">
                <TabsList className="grid grid-cols-3 w-full md:w-1/2">
                    <TabsTrigger value="users"><User className="w-4 h-4 mr-2" />Users</TabsTrigger>
                    <TabsTrigger value="restaurants"><Store className="w-4 h-4 mr-2" />Restaurants</TabsTrigger>
                    <TabsTrigger value="disputes"><ShieldAlert className="w-4 h-4 mr-2" />Disputes</TabsTrigger>
                </TabsList>
                <TabsContent value="users" className="mt-6"><UserManagement /></TabsContent>
                <TabsContent value="restaurants" className="mt-6"><RestaurantManagement /></TabsContent>
                <TabsContent value="disputes" className="mt-6"><DisputeManagement /></TabsContent>
            </Tabs>
        </div>
    )
}
