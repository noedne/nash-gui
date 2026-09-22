CXX := docker run --rm \
	-v $(CURDIR):/src \
	-u $(shell id -u):$(shell id -g) \
	emscripten/emsdk em++

CXXFLAGS := -std=c++20 -O3 -I gambit/src

BUILD_DIR := build
TARGET := public/gambit.js

SRCS := $(shell find gambit/src/core gambit/src/games gambit/src/solvers -name '*.cc')
OBJS := $(patsubst %.cc,$(BUILD_DIR)/%.o,$(SRCS))

.PHONY: all clean

all: $(TARGET)

$(TARGET): src/gambit.cc $(OBJS)
	@mkdir -p $(dir $@)
	$(CXX) $(CXXFLAGS) \
		-o $@ \
		-s EXPORTED_FUNCTIONS=_solve,_free_array,_free \
		-s EXPORTED_RUNTIME_METHODS=HEAPF64,stringToNewUTF8 \
		src/gambit.cc $(OBJS)

$(BUILD_DIR)/%.o: %.cc
	@mkdir -p $(dir $@)
	$(CXX) $(CXXFLAGS) -c $< -o $@

clean:
	rm -rf $(BUILD_DIR) public/gambit.js public/gambit.wasm
