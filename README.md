# Simple regular grammar parser generator

The Swarm protocol evolved since 2012 in more or less the same direction, gradually becoming richer and richer.
Things became a bit hairy last November (2016) once object metadata structure was unified and made part of the protocol.
This weekend (11 Feb 2017) I finally realized how to write production rules in a concise way (see index.js).
As a result, 20 rather simple rules described the entire syntax.

By the Chomsky–Schützenberger hierarchy, Swarm is a regular language.
Hence, it is parsed by regular expressions.

This package exports the Grammar class that converts simple grammar
definitions into regex parsers.
