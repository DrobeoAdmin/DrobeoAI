import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Phone, Mail, Calendar, Target, Palette, Sun, Users } from "lucide-react";

export default function Profile() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const preferences = user.preferences || {};
  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
      
      {/* Basic Information Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
                <p className="text-gray-600">Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{user.email}</span>
                  </div>
                )}
                
                {user.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{user.phoneNumber}</span>
                    {user.phoneVerified && (
                      <Badge variant="secondary" className="text-xs">Verified</Badge>
                    )}
                  </div>
                )}
                
                {preferences.age && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Age: {preferences.age}</span>
                  </div>
                )}
                
                {preferences.gender && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700 capitalize">Gender: {preferences.gender}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Style Preferences Card */}
      {preferences.stylePreferences && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Palette className="h-5 w-5" />
              Style Preferences
            </CardTitle>
            <CardDescription>
              Your fashion style and color preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {preferences.stylePreferences.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Preferred Styles</h4>
                <div className="flex flex-wrap gap-2">
                  {preferences.stylePreferences.map((style: string) => (
                    <Badge key={style} variant="outline" className="capitalize">
                      {style}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {preferences.favoriteColors && preferences.favoriteColors.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Favorite Colors</h4>
                <div className="flex flex-wrap gap-2">
                  {preferences.favoriteColors.map((color: string) => (
                    <Badge key={color} variant="outline" className="capitalize">
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Seasonal Preferences Card */}
      {preferences.seasonalPreferences && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Sun className="h-5 w-5" />
              Seasonal Preferences
            </CardTitle>
            <CardDescription>
              Your preferred seasons and weather conditions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {preferences.seasonalPreferences.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Preferred Seasons</h4>
                <div className="flex flex-wrap gap-2">
                  {preferences.seasonalPreferences.map((season: string) => (
                    <Badge key={season} variant="outline" className="capitalize">
                      {season}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lifestyle & Occasions Card */}
      {preferences.occasionPreferences && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Users className="h-5 w-5" />
              Lifestyle & Occasions
            </CardTitle>
            <CardDescription>
              The occasions and events you dress for most often
            </CardDescription>
          </CardHeader>
          <CardContent>
            {preferences.occasionPreferences.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Common Occasions</h4>
                <div className="flex flex-wrap gap-2">
                  {preferences.occasionPreferences.map((occasion: string) => (
                    <Badge key={occasion} variant="outline" className="capitalize">
                      {occasion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Goals & Aspirations Card */}
      {preferences.goals && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Target className="h-5 w-5" />
              Fashion Goals
            </CardTitle>
            <CardDescription>
              What you want to achieve with your wardrobe
            </CardDescription>
          </CardHeader>
          <CardContent>
            {preferences.goals.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Your Goals</h4>
                <div className="flex flex-wrap gap-2">
                  {preferences.goals.map((goal: string) => (
                    <Badge key={goal} variant="outline" className="capitalize">
                      {goal}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4 pt-6 border-t">
        <Button variant="outline">
          Edit Profile
        </Button>
        <Button variant="outline">
          Update Preferences
        </Button>
      </div>
    </div>
  );
}