what's going on you guys clar welcome back to the channel Co Commerce in this video I'm going to show you how we can build a realtime chat application using
0:06
react superbase and Google authentication so let's have a look at what we're building you can see I actually have two browsers open that's
0:11
because I'm going to log in with Google on two separate accounts so let's go ahead and log in over here I'm going log in over here this is going to be one of
0:18
my accounts this logged into a completely different account you can see signed in as Clint at codec Commerce coding ecommerce.com you can see this
0:24
one e-commerce back in the day anyways so you can now see we actually have two users online and this is Dynamic by the
0:30
way it automatically updates as soon as we log out you see that changes uh back down to one we'll go ahead and sign back
0:36
in and you can see we actually shoot this a message hey what's up you actually see it displays in real time on
0:42
the opposite side of the screen and we're going to be using super base sockets for this we can go and chat back
0:48
not much yo and it's actually not that difficult to build I'm going to show you how to build this from start to finish
0:53
react superbase Google authentication little bit of Tailwind let's get started all right so here we are in vs code I'm
0:59
going to go ahead and press the control back tick button just to open up our terminal here and let's create our react application I'm going to type mpm create
1:05
V at latest and let's go ahead and install this inside the current directory let's find react we'll do
1:11
JavaScript plus the Speedy web compiler I'll type mpmi now we are using Tailwind for this for this build this isn't a
1:18
huge Tailwind uh tutorial but it's pretty easy to use if you're not familiar with just go to Tailwind css.com we'll click on get started and
1:25
this is a new UI for Tailwind I like it I like it uh we're using V so we'll just stay right here I'm going to copy that
1:33
and let's just go ahead and install um Tailwind next we need to add this uh import here inside the vit config so
1:40
let's just go ahead and grab that and we should find the V config and I guess we're just going to add it here to that
1:47
react there we go hopefully this will work let's import that and let's come down here and this looks a little bit
1:53
different from what I used to so let's do this we'll import this inside of our index. CSS so I'm import that there at
2:00
the top and I'm just going to remove I'm just going to delete all that body tag we'll leave the index.css let's delete
2:08
the app.css and let's go ahead and start our server I'm going to type npm rev start up our
2:14
development server let's close this we'll go to Local Host 5173 and let's go into our app.jsx let's
2:21
remove that it's looking for that we already deleted it all right so now you can see we actually have V installed it
2:27
looks kind of funny since we deleted the app.css file but that's okay we can go and delete that and let's just remove
2:32
everything inside here I'm just going to change this to a div instead of just like an empty fragment and we should
2:39
have just a blank screen so now that we have react installed we have Tailwind configured what I want to do first is
2:44
actually create like the container for our chat application so let's go ahead and do that we're going to do that in
2:50
here inside this div I'm going to have another div and then we're going to have another di here and this is going to be the header here I'm going to go Ahad and
2:56
make some comments so this is going to be the header and for this app here so we should have three divs right now I'm going to give this a class name I'm
3:02
going to say Flex width full whoops type that in the wrong space
3:08
using these shortcuts there we go class name I'm going to say width full we want
3:13
to say Flex H screen so say height 100 vport Heights justify Center and then
3:19
we'll say items Center and we want to say P4 for padding of one rim and let's
3:25
just go ahead and put some text in here we'll say header so we can just see that on the the screen there we can see
3:30
it right in the middle of the screen that's what we want right there so next let's come down to our just above our
3:36
header here and so what we just did was the outside of the screen now this is going to be the actual container of our
3:41
chat application so let's give this a class name I'm going to say border I'm going to say one pixels we can open open
3:46
up the brackets there to accept a custom value and Tailwind I'm going to say border gray 700 and let's do Max width
3:55
of 6xl we'll say width full and I'm going to say A Min height
4:00
of let's say 600 pixels and I'm going to say rounded large so we get some rounded Corners so
4:06
if you go ah and save that you can see we have this really faint gray um container that's going to be the
4:11
container of our chat application so let's go ahead and do our header next I'm going to give this header here a
4:17
class name so for our header here what we're going to say um we're going to have a couple things in our header here
4:23
we're going to have uh we want to say like who we're signed in as going to sign signed in as code Commerce we're
4:28
going to show how many users are currently logged into our chat application and then we also want to have the sign out button so inside here
4:34
we'll have a div and in this div we'll have we'll say signed in as name and
4:40
then just below this we'll have another P tag we'll say something like three users online and this is all going to be
4:46
dynamic when we set it up here in a bit then just below that div we'll have a button that says sign out we'll go and
4:52
save and let's see let's give this first div a class name whoops I'm going to go up to this one first here and what we're
4:58
going to say we're going to say Flex and we're going to say justify between so we're going to shove these divs the
5:03
opposite ends of their screen I'm going to say height 20 for the height of our little header here going say border
5:08
bottom we're going to say one pixel then we'll say border whoops I'm just going to say border gray 700 kind of give it
5:16
that same that same look and feel just like that then for this I'm going to say P4 for just a little bit of padding and
5:23
then I'm going to change this color I'm going to say text Gray 300 and let's see that looks good there
5:30
now for our users online so going to change this and we'll come back here to actually make this Dynamic you'll see
5:36
whenever we grab we can actually tell who signed into our application we'll just say text Gray 300 italic and then
5:43
we'll say uh text small so let's see how that looks pretty good our button does
5:48
look a little bit funny though so let's just go ahead and give this class name I'm going to say margin 2 then anything above small I'm going say margin right
5:54
of four and I think that looks pretty good smash the like button if you feel like you're getting value out of this
6:00
also if you're looking to get a job in Tech maybe your first job and you're kind of working on your resume you don't know what it should look like then click
6:05
the link below and I'll send you my personal resume that I used to get my last couple jobs in Tech so click the link below and I'll send it to you for
6:11
free um okay so now after this header here so we have this header we're going to create two more divs this one here is
6:17
going to be I'll give a little uh little notes here this is going to be our main chat right here and then we also want to
6:24
have another section and this is going to be like our message message input and we're going to go ahead and do that in message input uh right now so inside
6:31
here it's actually not going to be a div we're going to do a form I'll say form form then inside this form we're going
6:38
to have an input and you can do an input type text or you could do a text area I like the input type text a little bit
6:44
better there we go I like that I like to use that a little bit better I think it just looks a little bit cleaner but
6:49
either one's fine then after that input we're going to do a button that says like send or something like that now
6:55
let's give this a placeholder and we'll just say uh type a message
7:01
dot dot dot and let's go ahead and give this a class name we'll give it a little padding we'll say P2 with fold I'm going
7:06
to say BG it's basically going to be black but I want to give just a little bit of a like a uh I guess like a
7:13
overlay to it think that looks pretty good there so we' removed the 40 that 40 is just like a 40%
7:20
overlay or opacity rather and then we'll say rounded large just like that now
7:26
let's go ahead and give this button here I'm going to say class name I'm say margin top on four and I actually want
7:31
this to display underneath kind of taking up the full width of the screen then past a certain break point I want
7:36
it to display uh off to the right so anything above small and the small the sm's a small it's a 640 break uh break
7:42
point defined by Tailwind so I'm going to say margin top zero anything above small I'll say margin left of eight I
7:50
want to say BG blue 500 and say text white I'm going to say Max height of 12
7:57
so let's go ahead and save oh you know it's not actually taking in this blue cuz we're actually getting some button Styles uh from our index.css so we'll
8:04
just take that out that's fine though but that looks pretty good there um what we actually need to do next here is
8:09
style the form so I'm just going to say class name on the form
8:19
whoops now for this form I'll say flex and we'll say Flex column anything above small we'll say Flex row and then a
8:27
padding of four which is one ram we'll say border top again we'll just say one pixel to keep everything consistent and
8:32
we'll say border gray let's do 700 let's see how that looks pretty good I like
8:39
that there and let's go ahead and just inspect this if we look at it on a smaller screen for example you can now see the button uh displays just below
8:47
our message input but you notice it's kind of shoved up at the top of our messages and that's fine that's just because we haven't added anything inside
8:54
of our main chat element so let's go ahead and do that next let's go ahead and just open this up or you know what
9:00
before we do that let's just go ahead and install a super base and get our Google authentication working I think
9:05
it' be a lot more fun so let's go ahead and do that now so let's go to superbase
9:10
docs click on get started superb.com dooc click on get started uh we're using
9:16
react so I'm going to just select react scroll down this is saying to create our our app so all we need to do
9:23
is actually install superbase we're just going to grab that here npmi uh at superbase superbase DJs let's
9:31
go ahead and install that this is some stuff that we don't
9:37
necessarily need okay so from superb.com dos we're going to go and get started
9:43
here so uh from here let's see want products let's click on off
9:49
then we'll click this menu button and let's go to getting started we'll click on react we'll scroll down here we've
9:56
already installed uh superbase and here we go let's go ahead and grab this right here this entire
10:02
thing here we'll come over here and let's just import it we'll see we'll
10:07
just paste it right in there need to do a couple things here so let's go ahead and import the use effect hook and we're
10:13
also going to need a EnV file so let's go ahead and create ourv file and inside
10:18
here is where we're going to keep our super base keys so let's go back over here okay let's just go back to
10:24
superb.com we'll click start our project we're going to create a new project
10:31
just hit new project we can call this whatever you like I'm going to call this a superbase chat app something like that
10:38
database password generate a password you can save that one let's create the new project here all right so now it
10:43
gave us some keys we have some API Keys a non-key service roll key uh in our URL these are all confidential you don't
10:49
want to share these you don't want to use these I'm going to put these in myv file um so just make sure you sign up
10:54
and get your own because if you if you use these they won't work so what we're going to say in here we're just going to say uh V super
11:01
basore superbase URL and then we're going to have a v we'll say super basore
11:08
a non key just like that and then let's go ahead and grab our keys so I'm going to copy this whoops where' it
11:16
go oh no okay let me go back and find it here dashboard and super Bas chat
11:22
app there we go uh so I'm going to grab the project URL we'll paste that in
11:27
there then the Anon key I'll grab that and I'll paste that in there and that's
11:32
all we need for now you don't need the any other Keys that'll be it for now we go ahead and close that all right so I'm
11:39
going to open up a new browser here and this is how we're going to create our um just a free Google account to be able to
11:45
sign in with Google authentication so I'm going to type in Google Cloud console cloud or sorry console.
11:50
cloud.google.com getting started this should be what you see here as it
11:56
loads and what we're going to do here let's go go ahead and click this menu button here and again sign up this is
12:01
completely free we're going to go to apis and
12:07
services open this up a bit and what we're going to do is create a new project you go I'm going to just call
12:14
this super base chat something like that whatever you want okay so inside here
12:19
what we're going to do so we actually have to set up some credentials first and this is quick and it's easy okay so
12:25
let's go ahead and set those up I'll just click credentials let's create some credentials I'm going to click on ooth
12:31
client ID let's configure the consent
12:38
screen and I'm just going to use internal for now that's fine it's going
12:43
to want some information I'll just call this super base chat something like that
12:49
a support email I think it needs one
12:55
more there we there we go all right all right save and continue and meanwhile
13:03
over here let's go to we need to find oth so we'll click on the menu let's go to
13:11
authentication and okay this is good we're done here so next let's go
13:16
to credentials okay and what we're going to do here we're going to create
13:22
credentials ooth client ID application type it's going to be a web application
13:27
and you can just leave the name like it is is or you can change it if you want to but we're going to come down here to authorized uh redirect uis we're going
13:34
to click on that and now we need to go back over to superbase here and inside
13:40
superbase let's click our menu and we're going to click on providers and these are all the list of
13:46
providers you can use to authenticate uh through subase we're just using Google so let's click on Google we want to
13:53
enable that and here we want to grab the client IDs here and the redirect URL so this is the Callback URL we're going to
13:59
copy that we'll paste it in here we're going to go and hit create and now this
14:04
is what Google gives us to give back to superbase so our client ID we'll copy
14:10
that we'll paste that in here for superbase and then our client secret we'll copy that we'll paste that back in
14:16
there as well and then next let's come back over here we'll just hit save and that should literally be everything we
14:22
need to do uh in order to configure Google authentication through uh subase
14:28
now we do have to write a couple functions be able to sign in but as far as uh superbase and Google talking with
14:33
one another that should be it all right so let's go back into our project
14:39
here I'm going to find authentication and now let's just write start writing some code to see if we can pop a user in
14:46
here and actually authenticate and before we move forward we actually need to import a few things so super base we need to create a see we
14:53
actually need to create a superbase client here so I'm going to create a new file here I'm going to call it super
14:59
base client.js and inside here we're going to need just a couple things uh we're going
15:05
to import create client from at superbase superbas DJs and we'd actually
15:13
bring in our uh our keys from ourv file so I'm going to say cons superbase URL
15:19
equal to import. meta env. VOR superbase
15:25
URL just like so and then we'll do the same thing for our an non key so we'll say superbase um a non key equal to
15:33
import. meta env. Vore superbase a
15:38
noncore key then we'll just say export const we'll say super base equal to
15:44
we'll say create client and then we're just going to pass in the superbase URL and the super base non key let's just go
15:52
and save that now we can import this superbase here inside of our app.jsx
15:59
okay so of course it's not wanting to Auto Import that's fine we'll say import we'll just say super
16:06
base from superbase client there we go let's
16:11
go ahead and save took care of that so we're trying to set a session here what we grabbed over from superbase we we
16:17
actually don't have any state so I'm going to say cons session set session
16:22
and this is actually going to run when it gets some data back from uh super base and that's going to be an
16:29
array here so let's go ahead and set up like a sign in and a or signin function and also a sign out function so this is
16:36
going to be real easy I'll just minimize that we'll have a sign in sign in function and what we're going
16:42
to say is const sign in equal to async asynchronous function and then we'll
16:48
just say await Super base. O do sign in
16:55
with oo there we go and we're just going to pass in the provider and this is just
17:01
going to be Google and let's go a and create a sign out function while we're at it say sign out and inside here we'll
17:07
say const sign out equal to async and inside here we'll just say
17:14
const error equal to await superbase doo. sign out now we
17:21
just need to call this function so in our header it's our sign out button we're just going to say onclick
17:29
we just to run the sign out function now to sign in we don't really have a signin button because we're just displaying uh
17:35
this container here so what we're going to do if we just minimize this just a little bit here what we'll say over
17:41
here we'll say if there's no session then we actually don't want to render all that we just want to show we'll say
17:49
return and this is just going to be a div like a div and then a
17:55
button that says we'll just say sign in with Google to chat and let's just go a and give this
18:01
just a little bit of styling actually be the same as this one here so let's just copy that
18:07
over I'll paste that in here not children we'll say class name we don't
18:12
really need the padding there we'll take that away so now what we can say we'll grab this here we'll cut it and we'll
18:18
say if there's no session return this
18:23
else return our chat container so oh we're going start our server back up npm
18:29
runev let's see if we have any errors or anything and we should just see the sign into chat
18:36
hopefully uh oh we don't see anything at all oh there we go getting a little
18:42
laggy there for a second all right so now we have sign in with chat because there is no
18:48
session so if this were to change right if our logic were to change we should actually see the chat application but we
18:54
don't want that for now so now the question is if we click this sign in with Google to chat are we going to
18:59
actually get redirected to Google and be able to sign into Google to get access to our application let's give it a shot
19:05
we'll see let's click on this here oh we don't nothing happened was we didn't even add it to our header here so where
19:11
is our uh right here we need to have an onclick function and on that on click we're going to run this sign in so we'll
19:17
just say onclick sign in let's go ahead and save we'll try
19:23
this again it's redirecting us I'm going I'm going to sign
19:30
in oops let's go back oops I think I checked the wrong thing it's blocking us cuz we're not
19:36
inside the organization that's fine just open your Google chat or your Google uh Cloud console back open let's find our
19:43
superbase chat here this is it here and where are we at let's go to whoops let's
19:49
go to apis and services credential oh that was it right there actually configure ooth
19:56
screen oo consent screen and we'll just simply switch
20:01
this make
20:07
external let's do in production just like that we'll confirm so we need to
20:13
save let's go back and try this
20:19
again sign in with Google yes continue ah there we have it
20:27
perfect okay so now it works we just had to make that minor little update and let me go ahead and just there we go all
20:34
right so now we're actually signed in um signed in his name it's not working three users online that's not working
20:39
but let's go ahead and just console log console.log our session because we're
20:46
setting that inside of this use effect right so we're setting our session in here and if we console log it you can
20:52
actually see the session that we're getting back uh from uh superbase Google
20:59
what however you want to look at it so uh this is the session here and if we
21:04
access the user we get all this metadata in here uh user metadata last last
21:09
signed in profile pick so on and so forth and we're going to use all that in this uh application that we're building
21:15
so here where it says signed in with name we're going to go ahead and actually put our own name in there so if
21:21
we go down here and say signed in I'm going going say that well make that uppercase signed in as
21:28
name dot dot dot what we're going to do here we'll just open up some curly brackets and how we're going to access
21:34
this is the session right so we'll say session user. email put one more in
21:41
there so this should now say hey depending on who you're signed in as don't make fun of my name I was doing
21:47
some e-commerce for a little bit still am but it's going all right struggle out there so you can say
21:53
signed in as name uh or as your email if you want to change that for example if you come down here
22:00
user if you click on user metadata so this is what we're accessing right here if you change that there that email you
22:07
could change it to full uncore name and it'll just REM uh render whatever Google has on you there so for example full
22:14
uncore name H is that right render as name
22:21
signed in is let's see how that works signed in as full name maybe that's not
22:27
working oh I'm a dummy this is actually user
22:34
unor meta data full name all right so there you
22:40
can see signed in as clent um but you know for this I'm just going to say you could do email chat whatever I don't
22:47
know it's up to you how you want to how you want to display your app uh but now
22:52
so we can sign in we can authenticate we're actually displaying uh who's actually authenticated who's logged into our app so we need to be able to sign
22:59
out too so where's our sign out button here at the top right so on click if we
23:05
sign out hopefully this works there we have it so now we have basic sign in
23:10
sign out functionality incorporated into our superbase chat application so now
23:15
let's go ahead and we'll sign back in here let's go ahead and incorporate the actually chatting part of this messages
23:20
we're going to we're going to have of our of our project here we're going to have all our messages kind of be rendered here in the middle so we have
23:26
our header there we have our main chap is just just an empty div so let's go ahead and play with that one right now
23:33
see what we're going to add in here so I'm going to give this a class name and what I want this to be we'll say p-4
23:39
we'll say Flex Flex column overflow y Auto and that's going to make it scroll
23:45
whenever users are typing in their messages and I'm going to say height of 500 pixels so that should kind of shove
23:52
everything down to the bottom now it's starting to look like a chat application smash like button if you think this is
23:57
cool you may be getting little value out of it I don't know and what we're going to do next is actually render out uh
24:04
some messages here so we don't have any messages to send we don't have any messages stored so I'm going to scroll
24:09
on up here to the top but before we do that like four our messages so we're going to need to add some more States so for our messages we're actually going to
24:16
need some state to store all of our messages then we're also going to need some state to store uh a new message so
24:22
and then also to to keep some users online to show how many users online so I'm going to say con we'll do m mesages
24:28
we'll do set messages equal to use State and by default this is going to be uh an empty
24:35
array there um actually yeah we'll just leave that
24:40
empty array next for our actual message we'll say new message this is for
24:47
whoever might be typing set new message and this is going to be you State this is going to be an empty string and then
24:53
we'll just say const users online set users online this is actually how many
24:59
people are currently logged in to our uh to our chat room so let's come down to
25:04
our input here inside of our form and for our input we're going to need a few things so we have the placeholder a type
25:11
and our class name we're also going to need a value and the value is just going to be a new message that state we just
25:17
created and then we'll say onchange onchange PR the event and we're going to
25:24
set the new message to the event. target. value so the way we're going to
25:29
have this real time they their sockets uh with superbase it's called channels and that's what superbase uses so we'll
25:36
come up here and what we're going to do is like basically just create a channel for superbase to listen to and we're going to do this inside of a use
25:46
effect we's add the dependency session so first off if there's we'll say if
25:53
there's no session user want to go ahead and set
25:58
users online we'll just set that to an empty array and we want to return
26:04
that next this is going to be our room so we'll say const we'll say room one equal
26:10
to Super base. Channel and then we'll just say room one you can call it
26:16
whatever you like we'll just say room one we're only going to have one room anyways we're going to say config inside here we'll say
26:24
presents and we'll say a key and this is going to be our session _ user _ ID let's go ahead and save then
26:34
we're going to using broadcast which is also a super based function here so we'll say room
26:40
one.on open up the parenthesis and we'll say broadcast in quotes want the event
26:48
message it's going to be a string and then we're going to use an arrow function and pass in
26:56
payload and we'll set messages to prieve
27:01
messages and we're just going to use the spread operator for prieve messages then
27:06
payload do M or sorry payload and we can go ahe and console.log it if we want to console.log
27:14
the messages let's go ahead and save now we want to track user pre uh presence here so we have our room set up and if
27:21
we want to just track we'll say track user presence and subscribe subscribe to the channel
27:28
Channel too by the way so we'll say room 1. subscribe and we'll just say async
27:34
it's going to be a status function here we'll say if
27:39
status equal and this is what we're getting back from superbase we'll say subscribed then what we want to do is
27:45
await room one. track open up parentheses in our curly brackets and
27:51
we'll say ID this is just a session ID of the
27:56
user and and we also want to be able to track up here where we say three users online if someone uh leaves from the
28:03
chat room we want to update that uh dynamically and up to date so we're
28:08
going to come down here and we'll just say handle user presence again and so
28:14
inside here we'll say room one.on we'll say presents and again we're going to
28:20
get a event sync this is going to be a call
28:26
back function we'll say cons State equal to room 1.
28:33
presence State and then we'll just set users online we'll say object. keys
28:39
State let's go and save and then finally what we need to do is actually unsubscribe from this room so we'll say
28:50
return we'll say room one. unsubscribe all right I think that looks
28:57
pretty good um we're going to need to do a couple more things uh to be able to send a
29:04
message so we'll do that need a send message we'll say send message and we're
29:11
also going to add a timestamp to the messages that we send as well but let's go ahead and set this thing up so we can
29:16
actually send a message so our input is where we're going to we're going to set non-change to our input so whatever we
29:22
type in here is going to appear on the screen let's come back up here and we'll do our send message
29:28
function here so I'm going to say const send message it's going to be an asynchronous function we're going to
29:34
have the event in here whoops e. prevent default we don't want
29:41
to uh submit our form or anything like that so we'll say superbase super base. Channel and
29:48
there's a lot of really great documentation on here if you want to read the docs I I strongly suggest you do so I was able to throw this together
29:54
actually after just reading the docs for just a short time so it's actually it's really not that hard so we'll say broadcast and then we'll just say
30:03
event it's going to be message and then we just need to get the payload and the
30:08
payloads will have message and so the payload that we're sending is the new
30:14
message state that we have and we can send some other things through as well
30:19
um and this is just stuff that we want to render out on the UI or if you want to save it in the database you can do that too we're not going to do that in
30:25
this video but for the sake of this video whenever a user submits a message we want that message to display on the
30:30
screen a few things you also might want is um the user's email or their name who
30:36
sending it so you can kind of render it by their by the message uh we're also going to use the Avatar and then I'm
30:41
also going to include a timestamp that the message was sent so we can go and do that here I'll just say username and we
30:47
already found where this a lot of this stuff was in the metadata down here right oh it's giving me an error there
30:53
but if you just comment that out you know a lot of this is found just here and like the user metadata so if we
31:00
go to user metadata this is what we're going to display for example this Avatar
31:08
URL so we'll uncomment that and so for the username that's just going to be session
31:14
uncore user and this going to be user meta data meta metad data there we go
31:21
meta data and then also we're going to use the email and then for Avatar we
31:27
said that was a session uncore user uncore user metadata underscore Avatar I
31:35
see I misspelled that cool all right and then the time
31:40
stamp forgot we're doing the time stamp uh let's say time stamp whoops not time ranges time
31:48
stamp and we'll just say new date oops new date there we go new date. 2 IO
31:55
string cool let's do that so that's give a current time stamp whenever a user submits a message and then finally we
32:01
probably want to set new message just to a blank uh state after we send this so
32:07
let's go ahead and type something and see uh actually we're not rendering anything out so nothing's going to happen I forgot we haven't done that yet
32:14
so again yeah you can see nothing happens at least our form done submit so what we want to do here we just getting
32:19
this empty object let's come down to our main chat here I'm just going to drop
32:26
that down a little bit drop that so inside this main chat this is where this
32:31
is where we're going to render out all of our messages so what we'll say here uh going to say messages. map whoops and
32:42
we'll say message and we want the index there and for now we'll just give a P
32:48
tag I'm just going to say message. message let's go ahead and save see if
32:54
anything works now oh we forgot to add an on I forget we we forgot to add the uh
32:59
onsubmit so we'll add that in here we'll say on submit cuz we didn't write it yet
33:05
or now we have we'll say send message and this is just the function that we have above here that we just wrote so
33:13
now we have something in here send a message you can see it actually displays on the screen we're getting a couple
33:19
errors uh child and react needs a unique identifier that's cool so we'll come down here uh where our message is at um
33:26
we'll take care of that in a second cuz we're going to change how we uh render everything we're not just going to render out a P tag but you can see we
33:32
can actually render stuff on the screen that's pretty awesome and I wanted to just open this up here if we sign in
33:37
over here and this is a different Google account that I'm going to be signing in with yes yes continue so now you can see
33:46
if we paste something in here it actually shows up on the screen I'm a different account we'll go ahead and
33:52
send that over so you can see we're actually trading messages back and forth um but we actually want to make some UI
33:58
improvements so we can see which message is coming from who and we're also going to add in some metadata so on and so
34:03
forth so I'm going to go ahead and just remove that one for now let's refresh and let's go ahead and just start
34:08
working on like the UI the layout of actual like our the main body of our chat chat messages so inside here I'm
34:15
actually just going to cut that so I don't want to just display that I'm going to display a div in here and
34:20
inside this div here there we go we'll put that inside
34:25
the div there for now and this is going to be the the individual message container and what we want to say if if
34:31
we're the sender we want this message to appear on the right side of the screen and if we're not the sender then we want
34:36
it to display on the left side of the screen so how we're going to do that we'll give it a class name and we're actually going to have some Dynamic
34:42
values so we're going to open up some curly brackets in here we use the back ticks and we always want this to have a margin of Y of two so we're going to add
34:48
that in there I'm going to say Flex width full items start here now I'm going to do um some Dynamic values we'll
34:56
do the dollar sign and some some curly brackets and I'm going to say if the message. username which is what we're
35:02
passing in with each message right so if that username is equal to the logged in user which we can access through our
35:09
session so we'll say session _ user or do
35:14
user email so if that statement is true so if that statement is true what we
35:20
want to say is justify justify end else what we want to
35:26
say is justify start so let's see if we type something
35:31
in now we can actually see it on the right side of the screen and I've have this other browser open you can't see it
35:37
but let's let's see if it works so I'm subm to get off the screen and you can see that the the other sender the
35:43
receiver on this case is coming in on the opposite side of the screen so that is perfect that's what we want right there so next we want to use the Avatar
35:50
right the little the picture that you may have with Google or just the rounded circle with your initials whatever you
35:56
have set up so let's go ahe and do that we'll say uh and we're going to have to
36:01
have two versions of this depending on um if you're on the right or the left so we'll say uh received message Avatar
36:11
Avatar on left something like that okay and inside here what we're going to say is message.
36:17
username and if this is equal to the session. user. email if this is
36:26
true what we're going to render out the image and instead of the source let's
36:31
comment we'll get rid of the quotes and we'll just say message. Avatar which is
36:37
what we're getting from our actual message and you can just put a slash in there doesn't really matter and
36:43
hopefully we see something here H there's a little bit of image there's an image there what we want to do is actually give some styling on this so
36:49
I'm going to say class name I'm going say width 10 height of 10 which is like just over
36:56
one rim or just over two rim and then we'll just say uh rounded full I'm going
37:01
to say margin right of two I'm going to give this a refresh o we're still getting this key
37:08
thing so I'm just going to do this real quick so we can take care of that we'll say key idx that takes care of that uh
37:16
error there so we're still not getting we're still not getting an image
37:22
so let's see what's going on there I'm going to look over here
37:28
might just be accessing it in the wrong place user underscore session
37:33
user metadata Avatar URL so I think that's
37:39
the problem let's see if that works okay
37:44
there we go perfect so we just had Avatar in there instead of the Avatar uncore uh URL that's inside the user
37:52
metad data that we're getting back uh from Google so apologies for that um
38:00
where were we all right so we are rendering out our
38:05
message there and we just finished rendering out our Avatar if it's on the left
38:11
here next let's go ahead and we're going to give like a chat bubble so it's just kind of easier on the UI easier to read
38:17
so let's just create a div here and I'm going to put this message inside there for now I'm going to give
38:23
this a class name and what we're going to say here is flex we'll say Flex column withd full so we're going to have
38:29
a couple things in here then for this container this is going to be the actual color right the actual color if it's
38:35
green or gray however we want to do it I'm going to say class name whoops class name and instead of
38:44
those quotes we're going to use the curly brackets we can have some Dynamic values in here I'm going to say a padding of we need some back ticks
38:50
padding of one and then we'll say a Max width of we'll say 70% and this means
38:56
that no matter however long this messages it'll just start to wrap if it's pasted 70% we'll say rounded XEL um
39:05
and then still inside of our curly brackets we'll open up some Dynamic values here and we'll save the message.
39:12
username so if this is equal to the logged in user so if in other words if
39:18
you are the one sending the message this is what we want this these are the Styles we want to give you and we'll
39:25
say there else we're going to give this different styles so if you are the logged in user and you're the one
39:30
sending the message I'm going to say BG gray 700 600 doesn't matter I'm going
39:36
say text white and I'm going to say margin left Auto because this is going to be on
39:42
the right side of the screen and let's just copy this down so
39:47
if you're the receiver we won't want that 700 we'll change it to 500 so it's a slightly different color we'll change
39:53
this to margin right Auto let's give it a ref refresh and see what happens so we should be on the
40:00
right looks good uh this is kind of looking funky we haven't uh played around with that yet and we'll bring
40:06
this one back over here we'll send so now you can see these are kind of showing up on different sides of the screen we still have our image uh not
40:13
exactly where we want it but that's okay we'll take care of that in a
40:19
second just give bit of refresh there all right we got item start perfect so
40:24
next let's go ahead and add a time stamp so we'll just say Tim stamp of the message something like that Tim stamp so
40:32
inside here and we're going to add this just below that div here um and what we're going to say we'll say t
40:38
message. timestamp something like that I think hopefully see if that renders hey there
40:45
we go we get this ugly unformatted Tim stamp or at least it's not formatted in a way that we can readily read it and
40:51
know what it's saying so we'll handle that so we can actually display what we want um let's go ahead and just give
40:57
this some class name real quick too so for our um timing here I'm going to take
41:02
away that we'll do some custom values here so I'll have the back tick I'm going to say text I want to say extra
41:08
small I want the opacity to be 75 padding top of
41:13
one and we'll say if message. username equal to session. user. email
41:22
if that's true we want to render something out else or not render we'll have a certain set of styles otherwise
41:28
we'll have different styles and we'll just say text right and we want to have margin right of two and else if they're
41:36
not we'll say text left margin left two so let's go ahead and save now you can
41:42
see it's kind of displaying right under there and it's looking good that's bothering me we're going to get to that in a second though let's format our time
41:48
and we can do that up here uh we'll just set it I'll set it right here doesn't really
41:54
matter and what we'll say here we'll it's just going to be a function we'll say const format time equal to we'll
42:01
pass in whoa format time equal to we'll pass in ISO
42:08
string just going to be an arrow function we'll say return new date there we go date ISO string dot say
42:18
two local time string that's what we want and we'll just
42:25
say- us curly brackets we'll say our
42:34
numeric minute to digit hour 12 we want that to be true so
42:42
let's save that and we'll come down to where we are rendering out the Tim stamp and inside here we'll just take that
42:49
like so actually we don't even need the brackets let's grab that and our name
42:55
was our function name was format time and we'll just pass in the message. time
43:01
so now you can see 352 looks pretty good that image though is bothering me on the
43:06
wrong side of the screen let's go ahead and fix that right now so underneath here we'll come down outside of the
43:12
container here and what we'll say here let's open up some curly brackets we'll say
43:18
message. user uncore name equal to
43:23
session. user. email if this is true we want to
43:28
render out uh the image let's just grab this up here where was that save some
43:34
typing all about the copy and the paste we'll paste that in here uh instead of
43:39
margin right two we'll say margin left two let's see hey wait a
43:45
minute looks like we're on both sides of the screen here let's just pull up our other one here to
43:51
refresh yeah so we're still on both sides of the screen that's not what we want oh hit the refresh oops okay go
43:57
back here um so yeah we still have this on the left side of the screen let's go take a
44:03
look um avatar on
44:08
left okay hold on we don't want that there we go okay so let's try this again
44:14
let me bring up my other window here we'll go Local Host 5173 we'll sign
44:21
in with somebody else we just going to make sure that this is indeed displaying correctly okay so that is what we want
44:27
that looks pretty good pretty good all right so now what we want to do I'm going to go ahead and just remove that
44:32
so right now it says we have three users online we don't have three users online we now just have one and we want this to
44:38
display Dynamic whenever someone logs in we want just to increment that by one and we should have already done that in
44:45
here up here with our this is our send message with our handle user presence so what we're going
44:52
to do now if we just come down to our users where's our sign signed in it's in
44:57
our header signed in as user three users online so what we'll do open up some
45:03
curly bracket and we'll just say users online this is actually just an array so we can just
45:08
saylen and hopefully it says two users online I'll show this screen again so we
45:14
have our two users online and if I sign out of this one this one over here you can see auto updates to one that's what
45:21
I'm talking about that looks pretty good you guys smash the like button if you feel like you're getting some value out of this we have another problem though
45:27
so if we go to laurum text or something like that there we go if we get this long paragraph for example we get this
45:33
long paragraph type it in here type this in here it looks good but if you notice
45:39
something we're still stuck at the end we're actually not scrolling down uh to the bottom of the screen and that's just
45:45
a poor user experience so what we're going to do um to fix that let's come back over here we'll find our so we have
45:52
our main chat we'll close that one for now let just kind of keep this nice and nice and clean so in side here just
45:57
under our button here we're going to use a ref so we'll say span it's just going to be empty but we'll say ref scroll and
46:03
we're actually going to um get this configured now so if we go back up to the top here we want to
46:10
import use ref just like that now we're just going to write another use effect
46:16
we can put it at the bottom here it's going of keep everything nice and neat I'll put this just below our format
46:24
time so we'll have another use effect
46:30
and this is going to run uh every time the messages dependency
46:35
changes so we're just going to say set set timeout we'll say if now we need to have
46:42
a few uh refs in here so we added that one down at the bottom so let's go up
46:47
here and we'll say just create a few things here we'll say const chat
46:52
container ref we'll say use ref n then we'll say chat or say cons uh
47:02
scroll equal to use ref there we
47:08
go looks pretty good let's go ahead and save get an error there there we
47:18
go oh we still have that we haven't uh it's giving us an error because we haven't we just left an ifty empty if
47:25
statement so we'll say if chat container ref.
47:31
current we're going to run this chat container ref. current. scroll
47:38
top equal to chat container ref. current. scroll
47:46
height and then we'll just add a dependency of 100 milliseconds let's go
47:53
ahead and save now we need to add a few things here in the header I believe here
47:58
actually it's going to go in the message component not the header because we want it to be at the top of the chat so
48:04
inside here and just inside of our main chat there we're just going to say ref and this is going to be the chat
48:10
container ref and then I believe we already added one down here yes the ref scroll so let's try this
48:18
again going to paste in our long message hopefully this works hey there we go now
48:24
let's Also let's also this Scrolls nicely make sure I'm going to open up
48:30
our other window here we'll make sure to sign in want to make sure it Scrolls on both sides whenever a new message comes
48:36
in and as you can see boom that new messages or new users online that looks good so I'm going to send a message over
48:42
here and this should scroll over here on the left hey looking pretty good looking
48:47
pretty good you guys smash the like button if you feel like you're getting some value out of this I appreciate you sticking along throughout the build that
48:54
should wrap it up right there though let's see we can out just a quick recap that should sign we can sign in here
48:59
with one account we're going to sign in here with another account once we have both windows open we'll make sure
49:05
authenticated on both two different Google accounts we click over there hello there you go hey how's it going
49:13
there you have it you guys thanks for watching smash the like button you guys if you're looking for that first um Tech
49:18
job and you're not sure what kind of resume you should have again I put the link below sign up I'll send you a free
49:24
tech resume the one that I used to get my jobs and just change around your specific skills your job history so on
49:29
and so forth so smash like button thanks for watching see you on the next one