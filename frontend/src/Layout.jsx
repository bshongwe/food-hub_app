
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, ShoppingBag, Clock, User, Store, Menu as MenuIcon, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { base44 } from "@/api/base44Client";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [cartCount, setCartCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        console.log("User data loaded:", userData); // Debug log
        setUser(userData);
      } catch (error) {
        console.log("No user logged in");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();

    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const count = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    };
    
    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

  const getNavItems = () => {
    const baseNav = [
      { name: "Home", path: createPageUrl("Home"), icon: Home },
    ];
    
    const profileNav = { name: "Profile", path: createPageUrl("Profile"), icon: User };

    if (!user) {
      return baseNav;
    }

    // Restaurant owner gets restaurant dashboard
    if (user.account_type === 'restaurant_owner') {
      return [
        ...baseNav,
        { name: "My Orders", path: createPageUrl("Orders"), icon: Clock },
        { name: "Dashboard", path: createPageUrl("RestaurantDashboard"), icon: Store },
        profileNav
      ];
    }

    // Admin gets everything (cart + admin dashboard)
    if (user.role === 'admin') {
      return [
        ...baseNav,
        { name: "Orders", path: createPageUrl("Orders"), icon: Clock },
        { name: "Cart", path: createPageUrl("Cart"), icon: ShoppingBag, badge: cartCount },
        { name: "Admin", path: createPageUrl("AdminDashboard"), icon: ShieldCheck },
        profileNav
      ];
    }

    // Client (or default) gets cart
    return [
      ...baseNav,
      { name: "Orders", path: createPageUrl("Orders"), icon: Clock },
      { name: "Cart", path: createPageUrl("Cart"), icon: ShoppingBag, badge: cartCount },
      profileNav
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        :root {
          --primary: #FF6B4A;
          --primary-dark: #E55A3A;
          --secondary: #1A1A1A;
          --accent: #FFB84D;
          --success: #10B981;
        }
      `}</style>

      {/* Desktop Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                FoodHub
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    location.pathname === item.path
                      ? "bg-orange-50 text-orange-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                  {item.badge > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-orange-500 text-white px-2 py-0.5">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <MenuIcon className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-2 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                        location.pathname === item.path
                          ? "bg-orange-50 text-orange-600"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                      {item.badge > 0 && (
                        <Badge className="ml-auto bg-orange-500">{item.badge}</Badge>
                      )}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>

      {/* Debug Info - Remove this after testing */}
      {!loading && (
        <div className="fixed bottom-4 right-4 bg-black text-white p-3 rounded-lg text-xs max-w-xs">
          <p><strong>User:</strong> {user?.email || 'Not logged in'}</p>
          <p><strong>Account Type:</strong> {user?.account_type || 'None'}</p>
          <p><strong>Role:</strong> {user?.role || 'None'}</p>
        </div>
      )}
    </div>
  );
}
