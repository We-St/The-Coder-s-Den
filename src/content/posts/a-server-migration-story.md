---
title: "A Server Migration Story"
date: 2015-01-08
template: post.hbt
abstract: A few weeks ago, one of the companies I was working for decided to migrate our test and production systems from Windows Server 2003 to 2012. Not only did we get an OS upgrade, we also got a new, much more powerful machine that could host our services for years to come. While migrating the test systems worked like a charm, we couldn't believe that the new, much more powerful machine couldn't handle the traffic on the production environment. A task our old, less poweful machine did easily.
---
# A Short Introduction

A couple of years ago, before WCF was omnipresent as means of implementing communication in .NET, my company wrote a small in-house solution for sending Request/Response data from a .NET client to a .NET server over TCP. This solution proved stable and extendible and is deployed to this day, although talks are going on to finally send it to a well-deserved retirement rather sooner than later.

The in-house solution used a very simple custom protocol, in which an object is serialized to a byte array by one party and sent to the other via TCP. Additionally to that, the sender would first add 4 bytes to the array which would denote the length of the serialized object, so that the recipient can allocate an adequate amount of space for the incoming message.

# The Migration
Once the decision was made to migrate to Windows Server 2012, the administrator setup a new machine with said operating system and all required frameworks installed. We deployed our servers and performed a couple of tests to the machine, which at that point in time could handle all production scenarios but operated on a non-production IP address. The tests were successful, so we simply switched IP addresses of the old and new machine on a lonely pre-Christmas evening. We ran our load testing tools against the now productive Win 2012 server and were happy to see everything working just fine. Shortly before leaving the office (after such a productive day of migrating the whole production system!) the sys admin called and curiously asked why the new machine was using all of the 16 gb of RAM. After connecting to the server and opening the task manager, a glimpse through hand-covered eyes confirmed our fears: our servers were using 4-5 gb each. We stopped and started them and sure enough, after a couple of minutes, each would use several gb again.

Our first idea was of course checking the logs, checking the connection to all required systems (such as the database servers), etc. As we couldn't find anything, we started some manuel tests on the machine (which by now did not have the production IP anymore of course), but cound't find anything. Indeed, the system remained completely stable until it got the production IP address, in which case it would go down without dignity in less then 10 minutes.

# Memory Profiler to the Rescue!
Since scanning the log files and the code itself didn't lead us anywhere, we came to the assumption that only a memory profiler could help us. Having the opportunity, I want to thank Red Gate for their awesome ANT Memory Profiler. That tool rocks!

Since we couldn't reproduce the problems in our test environment, we had to assign the production system IP to our new, much more powerful machine and do it life. So, on another lonely pre-Christmas evening, we sat down again: my boss (who was also the main developer of the in-house server), the sys admin and myself. We switched IPs and, sure enough, after a few minutes the system would scream and bend under a heavy load coming from no apparent source (since all employees who could have potentially used the system would have been home by then anyway). The memory profiler, however, showed us exactly what we did wrong. Before I tell you what stunningly-stupid error we made, I'll introduce the code to you. Any interested reader can try it's luck to find the error before I reveal it.

# The Source of all Evil
I removed logging and exception handling from the code to not clutter it too much. However all relevant lines are 1:1 copied from our server implementation. 

```vbnet
Dim client As TcpClient = ... ' Injected
Dim clientStream As NetworkStream = client.GetStream
 
' Read Message Size from the first 4 bytes
Dim length As Int32 = GetMessageSize(clientStream)
 
' Allocate Space
Dim msgBuffer(length - 1) As Byte
 
' Read Message Body
Dim bytesToRead As Int32 = length
Dim bytesRead As Int32 = 0
While bytesToRead > 0
 bytesRead = clientStream.Read(msgBuffer, length - bytesToRead, bytesToRead)
 bytesToRead -= bytesRead
End While
```

```vbnet
Private Function GetMessageSize(ByVal s As Stream) As Int32
 ' read the first 4 bytes from the stream and return their value as int
  Return ... 
End Function
```

# The Error Itself
Did you notice anything problematic with the code above? If you didn't, I can give you a small hint: the memory profiler told us that all the insane amount of memory allocated by our server was stored in one, single byte array. It even told us that the byte array was located in the code I just shared with you, and, since there is no other byte array than msgBuffer you can assume it to be the migration grinch.

# The Random Client
The problem, after all, was the way the protocol was processed on server side. Looking at line 5 and 7 of the code snippet, you can see that any amount of memory will be allocated as long as the number was sent by the client in its first 4 byte. Since we had control over all our clients (which could only connect from within our network), we felt sure regarding that side. We did not expect anyone opening a plain TCP connection and sending random bytes to our server. In fact, that's exactly what our watchdog processes did. We had a few of them running to ensure we would be notified on server downtime. These watchdogs would open a connection, send some bytes and close the connection again. The server didn't need to respond in a meaningful way to those alive messages, it just needed to accept the connection, which was enough for us.

This also explained why the problems only arose with the production IP address, since it was the only location covered by the watchdogs. The last mystery was soon to be uncovered as well: while everything worked out well on our old machine, the new, much more powerful machine would go down. This was simply because the new machine had to much memory installed. The old machine was covered by the watchdogs as well,  but line 7 would simply through an OutOfMemoryException every time the watchdogs connected. The new, much more powerful machine, however, would accept those requests and happily allocate whatever memory was requested.

# Lessons Learned
There is a multitude to learn from the above, some of the most important aspects are:

**Prepare your server for the worst:** to bring down our server, one malevolent client could bring down our whole production system. To repeat this, ONE client could stop the system. You couldn't even call that a DDOS attack, since you wouldn't need any distributed attack. ONE client was enough. To mitigate this risk, a few changes to the code were sufficient, e.g.

**Allocate what the client really sends, not what it requests:** we made the mistake to allocate all the required memory at once before the client even transferred one byte of payload. Instead, it is a much better approach to always read while there is data on the stream and concatenate the chunks to a finished message. This is also what the example on MSDN does. Since the watchdogs would only send a few bytes, that alone would have prevented anything bad from happening.

**Add sanity checks:** if you implemented the first improvement, a malevolent client can still deny service to the production system by flooding it with random bytes. To prevent this, some checks can be added, e.g. deny any request that already allcoated more than X gb, add read timeouts to not wait too long for clients, etc.

**Create meaningful watchdogs:** to ensure our servers were available, we were satisfied by checking if they accepted TCP connections. However, this didn't mean that our system was also able to handle business requests. What if the server was up but the database was down? We changed our watchdogs to send a meaningful message, which would go all the way to the database and query a simple SELECT getDate() just to make sure our whole software stack was tested by the watchdog each time.

If you made it so far, thumbs up and thanks for reading this. Although I hope to write another blog post soon, I hope this will be one of the last of my personal WTF moments for some time. **`Stay tuned!`**