---
tags:
  - post
  - advent-of-code-2017
  - coding
  - scala
title: Particle Swarm
header: Particle Swarm
date: 2017-12-27T05:00:00.000Z
updated: 2017-12-30T00:30:40.000Z
eleventyExcludeFromCollections: false
coverImage: https://static.goblinoid.co.uk/jeff-horton.uk/e1bd99e2-5071-4d00-87ac-d3c2f5005c9c.png
---
A solution for [Advent of Code 2017 - Day 20](http://adventofcode.com/2017/day/20)

## Part 1

For starters with today's input I'm going to need to turn my puzzle input into something useful.

{% raw %}
```scala
case class Coordinate(x: Long, y: Long, z: Long) {
  def +(that: Coordinate): Coordinate = copy(x = x + that.x, y = y + that.y, z = z + that.z)
  lazy val mag: Long = Math.abs(x) + Math.abs(y) + Math.abs(z)
}
// defined class Coordinate

case class Particle(index: Long, pos: Coordinate, vel: Coordinate, acc: Coordinate) {
  def next: Particle = copy(pos = pos + vel + acc, vel = vel + acc)
}
// defined class Particle

val LineMatcher = "p=<(-?\\d+),(-?\\d+),(-?\\d+)>, v=<(-?\\d+),(-?\\d+),(-?\\d+)>, a=<(-?\\d+),(-?\\d+),(-?\\d+)>".r
// LineMatcher: scala.util.matching.Regex = p=<(-?\d+),(-?\d+),(-?\d+)>, v=<(-?\d+),(-?\d+),(-?\d+)>, a=<(-?\d+),(-?\d+),(-?\d+)>

def parseLines(lines: TraversableOnce[String]): Seq[Particle] =
  lines.toSeq.zipWithIndex.collect {
    case (LineMatcher(px, py, pz, vx, vy, vz, ax, ay, az), i) => Particle(
      i,
      Coordinate(px.toLong, py.toLong, pz.toLong),
      Coordinate(vx.toLong, vy.toLong, vz.toLong),
      Coordinate(ax.toLong, ay.toLong, az.toLong)
    )
  }
// parseLines: (lines: TraversableOnce[String])Seq[Particle]
```
{% endraw %}

Given that in the limit, the closest particle is going to be among those with the least acceleration, my first idea is
to sort the particles by that and see what the slowest look like.

{% raw %}
```scala
import scala.io.Source
// import scala.io.Source

val input = parseLines(Source.fromResource("day20input.txt").getLines())
// input: Seq[Particle] = Stream(Particle(0,Coordinate(-11104,1791,5208),Coordinate(-6,36,-84),Coordinate(19,-5,-4)), ?)

implicit val coordinateOrder: Ordering[Coordinate] = Ordering.by(_.mag)
// coordinateOrder: Ordering[Coordinate] = scala.math.Ordering$$anon$10@1008febf

input.sortBy(_.acc).take(3).foreach(println)
// Particle(300,Coordinate(1585,1025,-980),Coordinate(-56,-35,35),Coordinate(0,0,0))
// Particle(74,Coordinate(863,3436,-1734),Coordinate(-28,-110,72),Coordinate(0,0,-1))
// Particle(172,Coordinate(-197,-954,-115),Coordinate(20,85,11),Coordinate(0,-1,0))
```
{% endraw %}

Which makes things easy as I can now just submit particle 300 as the answer.

First I'll check my working:

{% raw %}
```scala
import org.scalatest.{FunSuite, Matchers}
// import org.scalatest.{FunSuite, Matchers}

class Day20Part1Test extends FunSuite with Matchers {
  test("can parse lines") {
    parseLines(
      """p=<3,0,0>, v=<2,0,0>, a=<-1,0,0>
        |p=<4,0,0>, v=<0,0,0>, a=<-2,0,0>""".stripMargin.lines
    ) shouldBe Seq(
      Particle(
        0,
        Coordinate(3, 0, 0),
        Coordinate(2, 0, 0),
        Coordinate(-1, 0, 0)
      ),
      Particle(
        1,
        Coordinate(4, 0, 0),
        Coordinate(0, 0, 0),
        Coordinate(-2, 0, 0)
      )
    )
  }

  test("coordinates can be ordered") {
    Seq(
      Coordinate(0, -1, 0),
      Coordinate(0, -1, 3),
      Coordinate(2, 0, 0),
      Coordinate(0, 0, 0),
      Coordinate(1, -1, 1)
    ).sorted shouldBe Seq(
      Coordinate(0, 0, 0),
      Coordinate(0, -1, 0),
      Coordinate(2, 0, 0),
      Coordinate(1, -1, 1),
      Coordinate(0, -1, 3)
    )
  }
}
// defined class Day20Part1Test

(new Day20Part1Test).execute()
// Day20Part1Test:
// - can parse lines
// - coordinates can be ordered
```
{% endraw %}

## Part 2

For part two I think the best first step is just to run the simulation until the particle count is roughly stable.
Technically I'll need to run it until all the particles are moving away from each other, but working that out will not
be easy and probably unnecessary.

Determining the collisions is just a case of finding particles that share the same position as another, and filtering
them out. I picked 1000 iterations of the particle count staying the same as a reasonable approximation of determining
when the collisions were complete.

{% raw %}
```scala
def countSurvivingParticles(particles: Seq[Particle], count: Long = 0, prevLength: Int = 0): Int = {
  val newParticles: Seq[Particle] =
    particles
      .groupBy(_.pos)
      .filter {case (_, ps) => ps.lengthCompare(1) == 0}
      .flatMap(_._2)
      .map(_.next)
      .toSeq
      
  if(count % 1000 == 0) {
    if(newParticles.lengthCompare(prevLength) == 0)
      newParticles.length
    else
      countSurvivingParticles(newParticles, count + 1, newParticles.length)
  }
  else countSurvivingParticles(newParticles, count + 1, prevLength)
} 
// countSurvivingParticles: (particles: Seq[Particle], count: Long, prevLength: Int)Int
```
{% endraw %}
 
I can use the example from the puzzle to provide a test case. I also still need
to write tests for advancing particles to the next state.
 
{% raw %}
```scala
class Day20Part2Test extends FunSuite with Matchers {
  test("can step particles") {
    Particle(
      0,
      Coordinate(3, 0, 0),
      Coordinate(2, 0, 0),
      Coordinate(-1, 0, 0)
    ).next shouldBe
      Particle(
        0,
        Coordinate(4, 0, 0),
        Coordinate(1, 0, 0),
        Coordinate(-1, 0, 0)
      )
  
    Particle(
      0,
      Coordinate(3, 0, 0),
      Coordinate(2, 0, 0),
      Coordinate(-1, 0, 0)
    ).next.next shouldBe
      Particle(
        0,
        Coordinate(4, 0, 0),
        Coordinate(0, 0, 0),
        Coordinate(-1, 0, 0)
      )
  
  
    Particle(
      1,
      Coordinate(4, 0, 0),
      Coordinate(0, 0, 0),
      Coordinate(-2, 0, 0)
    ).next shouldBe
      Particle(
        1,
        Coordinate(2, 0, 0),
        Coordinate(-2, 0, 0),
        Coordinate(-2, 0, 0)
      )
  }
  
  test("can collide particles") {
    countSurvivingParticles(
      parseLines(
        """p=<-6,0,0>, v=<3,0,0>, a=<0,0,0>
          |p=<-4,0,0>, v=<2,0,0>, a=<0,0,0>
          |p=<-2,0,0>, v=<1,0,0>, a=<0,0,0>
          |p=<3,0,0>, v=<-1,0,0>, a=<0,0,0>""".stripMargin.lines
      )
    ) shouldBe 1
  }
}
// defined class Day20Part2Test

(new Day20Part2Test).execute()
// Day20Part2Test:
// - can step particles
// - can collide particles
```
{% endraw %}

I can now run the simulation and try the answer. 

{% raw %}
```scala
countSurvivingParticles(input)
// res3: Int = 502
```
{% endraw %}

Since that was counted as correct, I'll leave today there.
