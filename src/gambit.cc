#include "core/rational.h"
#include "core/vector.h"
#include "games/game.h"
#include "solvers/lcp/lcp.h"
#include <algorithm>
#include <sstream>

extern "C" {
double *solve(const char *c) {
  std::istringstream f(c);
  const auto game = Gambit::ReadEfgFile(f);
  const auto behavior = Gambit::Nash::LcpBehaviorSolve<Gambit::Rational>(game);
  const Gambit::Vector<Gambit::Rational> vec = behavior.equilibrium.value();
  const auto n = vec.size() / 2;
  const auto eqm = new double[n];
  std::copy(vec.begin(), vec.begin() + n, eqm);
  return eqm;
}

void free_array(double *ptr) { delete[] ptr; }
}