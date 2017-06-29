# exe
REDUCE      = reducing
COMPUTE     = computing

# arguments
FILE_IN     = "../data/homicides.csv"
REDUCE_OUT  = "../data/homicides_small.csv"
COMPUTE_OUT = "../data/sunburst"

# compilation flags
CFLAGS      = -std=gnu99 -Werror -Wall -Wextra
LDLIBS     = -lm

.PHONY: reduce compute pop all default

all: reduce compute pop

default:
	@echo "use 'make reduce' or 'make compute' or 'make pop'"

reduce: $(REDUCE)
	./$< $(FILE_IN) $(REDUCE_OUT)
	rm -f $<

compute: $(COMPUTE)
	./$< $(FILE_IN) $(COMPUTE_OUT)
	rm -f $<

pop: mergeOnAge mergeOnOrigin mergeOnStates
	./mergeOnAge
	./mergeOnOrigin
	./mergeOnStates
	rm -f $^ "../data/us_pop_merge_on_age.txt" "../data/us_pop_merge_on_age_and_origin.txt"
