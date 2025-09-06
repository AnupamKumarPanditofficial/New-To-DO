'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Copy, Users, LogIn, ArrowLeft } from 'lucide-react';
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  updateDoc,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User, CollabGroup } from '@/lib/types';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import FriendsAnalyticsChart from '@/components/collab/FriendsAnalyticsChart';
import SetGroupPurposeDialog from '@/components/collab/SetGroupPurposeDialog';

export default function CollabPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [group, setGroup] = useState<CollabGroup | null>(null);
  const [passkey, setPasskey] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isPurposeDialogOpen, setIsPurposeDialogOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('facetask_user');
    if (!storedUser) {
      router.replace('/');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    const storedGroupId = localStorage.getItem(`facetask_group_${parsedUser.id}`);
    if (storedGroupId) {
      const groupRef = doc(db, 'collabGroups', storedGroupId);
      const unsubscribe = onSnapshot(groupRef, (docSnap) => {
        if (docSnap.exists()) {
          const groupData = { id: docSnap.id, ...docSnap.data() } as CollabGroup;
          setGroup(groupData);
          if (!groupData.purpose) {
            setIsPurposeDialogOpen(true);
          }
        } else {
          localStorage.removeItem(`facetask_group_${parsedUser.id}`);
          setGroup(null);
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const createGroup = async () => {
    if (!user) return;
    setIsCreating(true);
    const groupId = crypto.randomUUID().slice(0, 8);
    const newGroup: CollabGroup = {
      id: groupId,
      members: [
        {
          id: user.id,
          name: user.name,
          tasks: [],
        },
      ],
    };
    try {
      await setDoc(doc(db, 'collabGroups', groupId), newGroup);
      localStorage.setItem(`facetask_group_${user.id}`, groupId);
      setGroup(newGroup);
      // Purpose dialog will be triggered by useEffect
    } catch (error) {
      console.error('Error creating group: ', error);
      toast({ title: 'Error creating group', variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  const joinGroup = async () => {
    if (!user || !passkey) return;
    setIsJoining(true);
    const groupRef = doc(db, 'collabGroups', passkey);
    try {
      const docSnap = await getDoc(groupRef);
      if (docSnap.exists()) {
        const existingGroup = docSnap.data() as CollabGroup;
        if (!existingGroup.members.some((member) => member.id === user.id)) {
          const updatedMembers = [
            ...existingGroup.members,
            { id: user.id, name: user.name, tasks: [] },
          ];
          await updateDoc(groupRef, { members: updatedMembers });
        }
        localStorage.setItem(`facetask_group_${user.id}`, passkey);
        setGroup({ id: passkey, ...docSnap.data() } as CollabGroup);
        // Purpose dialog will be triggered by useEffect
      } else {
        toast({ title: 'Group not found', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error joining group: ', error);
      toast({ title: 'Error joining group', variant: 'destructive' });
    } finally {
      setIsJoining(false);
    }
  };

  const leaveGroup = async () => {
    if (!user || !group) return;
    
    const groupRef = doc(db, 'collabGroups', group.id);
    
    try {
      // Find the member object to remove
      const memberToRemove = group.members.find(m => m.id === user.id);
      if (memberToRemove) {
        // Atomically remove the member from the 'members' array in Firestore.
        await updateDoc(groupRef, {
          members: arrayRemove(memberToRemove)
        });
      }
    } catch (error) {
       console.error("Error leaving group:", error);
       toast({ title: "Error leaving group", description: "Could not update the group in the database.", variant: "destructive" });
       // Still proceed with local cleanup
    } finally {
       localStorage.removeItem(`facetask_group_${user.id}`);
       setGroup(null);
       toast({ title: 'You have left the group.' });
    }
  };
  
  const copyPasskey = () => {
    if(!group?.id) return;
    navigator.clipboard.writeText(group.id);
    toast({ title: "Passkey copied to clipboard!" });
  }

  const handlePurposeSet = async (purposeData: Partial<CollabGroup>) => {
    if (!group) return;
    const groupRef = doc(db, 'collabGroups', group.id);
    await updateDoc(groupRef, purposeData);
    setIsPurposeDialogOpen(false);
    toast({ title: "Group purpose has been set!" });
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex justify-start">
            <Button variant="outline" onClick={() => router.push('/todo')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tasks
            </Button>
        </div>
        {group ? (
          <>
            <SetGroupPurposeDialog 
              isOpen={isPurposeDialogOpen}
              onOpenChange={setIsPurposeDialogOpen}
              onPurposeSet={handlePurposeSet}
            />
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Collaboration Dashboard</span>
                  <Button variant="ghost" onClick={copyPasskey} size="sm">
                    Passkey: {group.id} <Copy className="ml-2 h-4 w-4"/>
                  </Button>
                </CardTitle>
                <CardDescription>
                  Here is the real-time productivity of your group. 
                  {group.purpose === 'exams' && ` Currently preparing for: ${group.examName}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FriendsAnalyticsChart group={group} currentUser={user} />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="destructive" onClick={leaveGroup}>
                  Leave Group
                </Button>
                 <Button variant="outline" onClick={() => setIsPurposeDialogOpen(true)}>
                  Change Purpose
                </Button>
              </CardFooter>
            </Card>
          </>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Create a Group</CardTitle>
                <CardDescription>
                  Create a new group and invite your friends with a passkey.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={createGroup} disabled={isCreating} className="w-full">
                  {isCreating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Users className="mr-2 h-4 w-4" />
                  )}
                  Create Group
                </Button>
              </CardFooter>
            </Card>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Join a Group</CardTitle>
                <CardDescription>
                  Enter a passkey to join an existing group.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Enter passkey"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  disabled={isJoining}
                />
              </CardContent>
              <CardFooter>
                <Button onClick={joinGroup} disabled={isJoining} className="w-full">
                  {isJoining ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LogIn className="mr-2 h-4 w-4" />
                  )}
                  Join Group
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
