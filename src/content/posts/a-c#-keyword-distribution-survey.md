---
title: "A C# Keyword Distribution Survey"
date: 2014-08-15
template: post.hbt
abstract: C# has no less than 104 keywords. While some of them are the cool kids in the keyword playground and get a lot of attention, others stand outside the spotlight. A few even live a mysterious double life. In this blog post, I analyzed five popular C# open source projects for their keyword usage and found some keywords I've never heard of before.
---

When I was sitting in front of my PC writing the what felt like 100.000 property of my life, I asked myself how often I already used the "prop" + TAB snippet in Visual Studio. Soon after I asked myself about keywords in general and decided to make this the topic for this blog post. I analyzed five popluar C# projects (Enitity Framework, Nuget Paket Manager, Orchard, Roslyn, Virtual Router) which are all hosted on Codeplex in their latest versions (I downloaded them on the 14.08.2014). Before jumping to the results, let's see some facts:

* All projects together consist of 11.531 files
* All files have a total of 2.858.238 lines of code
* There are 2.014.343 keywords in those lines
* This makes roughly 1,42 keywords per line of code

Before we look into the details of the keyword distribution, I want to raise attention to the fact that this whole survey is of course by no means representative. I only analyzed five projects and choose them by popluarity rather than distribution them throughout the areas of C# usage. Having said that, let's see which keywords rule and which ones are eating all the glue.

<iframe class="chart" src="/content/refs/top-10-csharp-keywords/"></iframe>

No big suprises occur when looking at the top 10. All keywords are fundamental to C# and should be perfectly well-known to any person who every wrote a C# program or got hit by a C# cook book. I was a bit suprised to see the using statement in the top 10 rather than try, static or even int. Another thing that stroke me odd was the relation between the number of files and how often the class keyword occured: ~ 11.5k files contain ~64k classes, meaning that there are > 5 class occurrences per file on average. When looking into that, I found out that Roslyn is the main reasons for that (files: 3.199, class occurrences:  49.026). All other projects have a relation near the 1:1.
As well-known the top 10 may be, some people might wonder when looking at the other end of the scale, the bottom 10. Before I made this survey, I was rather sure to know or at least have heard of all C# keywords. To my surprise, there were one or two that got passed my attention.

<iframe class="chart" src="/content/refs/bottom-10-csharp-keywords/"></iframe>

The bottom 10 consist close to only of LINQ keywords and keywords used for writing unsafe code. To my great suprise (and horror), even the goto command made it to the list. I don't want to lament about good or bad coding habits, but I think it's save to say that this command can be easily avoided, resulting in a better and more readable code.
Finally, we can look at some other interesting metrics we can read out of the result set. The following chart shows the distribution of access modifiers (of which C# knows four: public, private, protected and internal) and the classical command flow control keywords (if, while, for, foreach and switch).

<iframe class="chart" src="/content/refs/control-flow-statement-distribution/"></iframe>

If you have any questions, feel free to ask them in the comments below or mail me straight away. **`Stay tuned!`**