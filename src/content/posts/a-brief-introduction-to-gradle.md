---
title: "A Brief Introduction to Gradle"
date: 2014-11-02
template: post.hbt
abstract: With Ant and Maven, the Java world has some powerful build tools at their disposal. In recent years, Gradle entered the game. Its new approach of describing the build in a Groovy DSL is both easy to learn and balm for all developer's souls, who were brought to the brink of madness by Maven's (sometimes cryptic) error messages. Gradle can manage dependencies (and is compatible with Maven repositories), compile, test and deploy applications. Since Gradle is based on Groovy, complexer scenarios can be described and even debugged, if problems arise.
---

# The Basics
Gradle is a Groovy-based build tool designed for compiling, testing and deploying JVM languages. Since every Gradle script consists purely of Groovy code, a Gradle build script can include conditions, loops and any other Java or Groovy code, including references to libraries. Let's look at a small example to get started:

```
task sayHiTask() << {
    println "Hello World"
}
 
task sayGoodByeTask(dependsOn: sayHiTask) << {
    println "Good Bye"
}
```

Each Gradle script consists of tasks, which may depend on each other. The above script can be triggered (after installing Gradle) by putting the code into a gradle.build file and executing the following command on the command line (in the same folder as the script):

```
> gradle -q sayGoodByeTask
Hello World
Good Bye
```

As we can see, Gradle detects that sayGoodByeTask depends on sayHiTask and executes both in the correct order.

# The Gradle DSL
Programmers familiar with Groovy might wonder for the correctness of the above code. Indeed, the sayHiTask is later used 
like a variable (by passing it to the dependsOn method of the second task), although it is nowhere initialized. For that 
and other purposes, Gradle introduces a DSL to describe the build process in an easier way. In our previous example, the 
task keyword and overriding the << operator are two examples. I will not go into details about the Gradle DSL here. 
Interested readers may refer to the excellent offical Gradle User Guide for more information on the Gradle DSL itself 
and to Domain-Specific Languages in Groovy for details on the underlying mechanisms that make Grooy an excellent 
language for implementing DSLs.

# Plug-ins
Gradle is designed for extensibility. Since a Gradle script is a Groovy program, it can reference other libraries
compiled to Java bytecode (e.g. Java, Groovy, Scala, JRuby, etc.) and use classes and methods from them. To support 
many different scenarios, Gradle is plug-in-based. By including plug-ins, different languages can be compiled, different 
source control systems supported, etc. Let's look at a small example for a build script to compile Java:

```
apply plugin: 'java'
 
dependencies {
    compile fileTree(dir: './libs/vendor', include: ['*.jar'])
}
 
uploadArchives {
    repositories {
       flatDir {
           dirs './target'
       }
    }
}
 
defaultTasks 'uploadArchives'
```

In the first line, we include the Java plug-in, which allows us the compliation of Java code. We include a list of 
external dependencies, which are placed as .jar files in the .libs/vendor folder and specify a folder to put the 
generated jar file into. As we can see, we do not need the task keyword when configuring the uploadArchives task. This 
is due to the fact that the uploadArchives task is already defined by the Java plug-in. We only configure it in our 
script. Finally, we specify the uploadArchives task as default task so we do not need to write it every time we call 
Gradle from the command line. You might ask now why this script even compiles our Java code? We do not mention the 
directory of the source code, a name for the resulting jar file or any task doing the actual compile work at all. The 
compilation task exists and is like the uploadArchives task introduced by the Java plug-in. We do not need to call it 
since the uploadArchives task depends on the compilation task. Executing the latter will therefore trigger the other one 
as well. Concerning the other points: Gradle heavily relies on convention over configuration and encourages plug-in 
developers to do the same. Each task should have meaningful default settings that only need overwriting occasionally. 
In our example, Gradle expects the Java code to be placed in src/main/java.

# Further Reading and More
Any interested readers are encouraged to look into the extensive Gradle User Guide. I will pick more detailed topics 
about Gradle in the future and present them here, so **`Stay tuned!`**
